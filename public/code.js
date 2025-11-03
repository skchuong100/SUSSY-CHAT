(function () {
  const app = document.querySelector(".app");
  const socket = io();

  // --- State ---
  let uname = null;
  let sharedKey = null;   // AES-GCM key
  let roomSaltB64 = null; // Base64 salt used to derive the key
  const PROTO_V = 1;

  // --- DOM helpers ---
  const qs = (sel) => app.querySelector(sel);

  // --- Tiny on-screen status (bottom-right) ---
  function showStatus(msg) {
    const el = document.getElementById("status") || (() => {
      const d = document.createElement("div");
      d.id = "status";
      d.style.cssText =
        "position:fixed;right:8px;bottom:8px;font:12px/1.4 system-ui,Segoe UI,Arial;background:#000;color:#fff;padding:6px 8px;border-radius:6px;opacity:.85;z-index:9999";
      document.body.appendChild(d);
      return d;
    })();
    el.textContent = msg;
  }

  // --- Crypto helpers (Web Crypto) ---
  function toB64(u8) {
    return btoa(String.fromCharCode(...u8));
  }
  function fromB64(s) {
    return new Uint8Array(atob(s).split("").map((c) => c.charCodeAt(0)));
  }

  async function makeKey(passphrase, saltB64) {
    const enc = new TextEncoder();
    const passBytes = enc.encode(passphrase);
    const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));

    const baseKey = await crypto.subtle.importKey("raw", passBytes, "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    return { key, saltB64: toB64(salt) };
  }

  async function encryptText(text, key) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // new per message
    theData = new TextEncoder().encode(text);
    const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, theData);
    return { ivB64: toB64(iv), ctB64: toB64(new Uint8Array(buf)) };
  }

  async function decryptText(ivB64, ctB64, key) {
    const iv = fromB64(ivB64);
    const ct = fromB64(ctB64);
    const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    return new TextDecoder().decode(buf);
  }

  // --- Join flow with key derivation ---
  qs(".join-screen #join-user").addEventListener("click", async function (e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    const username = qs(".join-screen #username").value.trim();
    const passphrase = qs(".join-screen #roomCode").value.trim();
    const isHost = qs(".join-screen #isHost").checked;

    if (!username || !passphrase) return;

    try {
      if (isHost) {
        // Host: create salt and show it on the form
        const { key, saltB64 } = await makeKey(passphrase, null);
        sharedKey = key;
        roomSaltB64 = saltB64;

        const saltRow = qs(".join-screen #saltRow");
        const saltOut = qs(".join-screen #saltOut");
        if (saltRow && saltOut) {
          saltRow.style.display = "block";
          saltOut.textContent = saltB64;
        }

        // IMPORTANT: show full salt before switching screens, and copy it
        try { await navigator.clipboard.writeText(roomSaltB64); } catch {}
        alert("Share this salt with guests:\n\n" + roomSaltB64 + "\n\n(It has been copied to the clipboard.)");
      } else {
        // Guest: paste host's salt
        const saltFromHost = window.prompt("Paste the salt shared by the host:");
        if (!saltFromHost) return;
        const { key, saltB64 } = await makeKey(passphrase, saltFromHost.trim());
        sharedKey = key;
        roomSaltB64 = saltB64;
      }

      showStatus(`Key ready • salt=${roomSaltB64.slice(0, 8)}…`);
    } catch (err) {
      console.error("Key derivation failed", err);
      alert("Could not set up encryption. Check the room code and salt.");
      return;
    }

    // Now switch to chat
    socket.emit("newuser", username);
    uname = username;
    qs(".join-screen").classList.remove("active");
    qs(".chat-screen").classList.add("active");

    // Focus message box on enter
    const input = qs(".chat-screen #message-input");
    if (input) input.focus();
  });

  // --- Send message (encrypt then emit) ---
  async function sendMessage() {
    const input = qs(".chat-screen #message-input");
    const message = input.value;

    if (!message) return;
    if (!sharedKey) {
      renderMessage("update", "Key not ready. Join with a room code first.");
      return;
    }

    // Show local copy
    renderMessage("my", { username: uname, text: message });

    try {
      const { ivB64, ctB64 } = await encryptText(message, sharedKey);
      socket.emit("chat", {
        v: PROTO_V,
        kind: "enc",
        iv: ivB64,
        data: ctB64,
        from: uname
      });
    } catch (err) {
      console.error("Encrypt failed", err);
      alert("Message encryption failed.");
    }

    input.value = "";
    input.focus();
  }

  qs(".chat-screen #send-message").addEventListener("click", sendMessage);

  // Enter to send
  qs(".chat-screen #message-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  // --- Exit ---
  qs(".chat-screen #exit-chat").addEventListener("click", function () {
    socket.emit("exituser", uname);
    // Clear sensitive state
    sharedKey = null;
    roomSaltB64 = null;
    window.location.href = window.location.href;
  });

  // --- Socket listeners ---
  socket.on("update", function (update) {
    renderMessage("update", update);
  });

  socket.on("chat", async function (payload) {
    try {
      // Legacy plain string
      if (typeof payload === "string") {
        renderMessage("other", { username: "Someone", text: payload });
        return;
      }
      // Legacy plaintext object
      if (payload && typeof payload === "object" && "text" in payload && "username" in payload) {
        renderMessage("other", payload);
        return;
      }
      // Encrypted
      if (payload && payload.kind === "enc") {
        if (!sharedKey) {
          renderMessage("update", "Encrypted message received, but no key is set. Join with the same code + salt.");
          return;
        }
        const plain = await decryptText(payload.iv, payload.data, sharedKey);
        renderMessage("other", { username: payload.from || "Someone", text: plain });
        return;
      }
      // Unknown
      renderMessage("update", "Received an unrecognized message format.");
    } catch (err) {
      console.error("Decrypt failed", err, payload);
      renderMessage(
        "update",
        "Received a message that could not be decrypted. Make sure both sides used the SAME room code and salt."
      );
    }
  });

  // --- Rendering (safe text insertion; no HTML injection) ---
  function renderMessage(type, message) {
    const messageContainer = qs(".chat-screen .messages");

    if (type === "my") {
      const el = document.createElement("div");
      el.setAttribute("class", "message my-message");

      const inner = document.createElement("div");
      const name = document.createElement("div");
      const text = document.createElement("div");

      name.setAttribute("class", "name");
      text.setAttribute("class", "text");

      name.textContent = "You";
      text.textContent = message.text;

      inner.appendChild(name);
      inner.appendChild(text);
      el.appendChild(inner);
      messageContainer.appendChild(el);
    } else if (type === "other") {
      const el = document.createElement("div");
      el.setAttribute("class", "message other-message");

      const inner = document.createElement("div");
      const name = document.createElement("div");
      const text = document.createElement("div");

      name.setAttribute("class", "name");
      text.setAttribute("class", "text");

      name.textContent = message.username;
      text.textContent = message.text;

      inner.appendChild(name);
      inner.appendChild(text);
      el.appendChild(inner);
      messageContainer.appendChild(el);
    } else if (type === "update") {
      const el = document.createElement("div");
      el.setAttribute("class", "update");
      el.textContent = message;
      messageContainer.appendChild(el);
    }

    messageContainer.scrollTop =
      messageContainer.scrollHeight - messageContainer.clientHeight;
  }
})();
