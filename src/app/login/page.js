"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { login } from "@/lib/appwrite";

/* ─────────────────────────────────────────────
   Neural Network Canvas (Pure Canvas 2D + 3D-feel)
──────────────────────────────────────────────── */
function NeuralNetworkCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const mousemove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", mousemove);

    // Generate nodes
    const NODE_COUNT = 80;
    const nodes = Array.from({ length: NODE_COUNT }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2 + 0.3,          // depth layer (0.3–2.3)
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2,  // phase
      active: Math.random() > 0.7,
    }));
    nodesRef.current = nodes;

    const MAX_DIST = 160;
    let t = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update positions
      nodes.forEach((n) => {
        n.pulse += 0.02;
        // Slight mouse attraction
        const dx = mouseRef.current.x - n.x;
        const dy = mouseRef.current.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          n.vx += (dx / dist) * 0.012;
          n.vy += (dy / dist) * 0.012;
        }
        n.vx *= 0.98;
        n.vy *= 0.98;
        n.x += n.vx;
        n.y += n.vy;
        // Bounce
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.x = Math.max(0, Math.min(canvas.width, n.x));
        n.y = Math.max(0, Math.min(canvas.height, n.y));
      });

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35 * Math.min(a.z, b.z);
            // Signal pulse traveling along the edge
            const pulse = Math.abs(Math.sin(t * 2 + a.pulse)) * 0.5;
            const edgeAlpha = alpha + pulse * alpha;

            // Color: purple-blue for normal, cyan for active signals
            const isActive = a.active || b.active;
            const r = isActive ? 120 : 99;
            const g = isActive ? 220 : 102;
            const bVal = isActive ? 255 : 241;
            ctx.strokeStyle = `rgba(${r}, ${g}, ${bVal}, ${edgeAlpha})`;
            ctx.lineWidth = 0.6 * Math.min(a.z, b.z);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();

            // Signal dot
            if (isActive && dist < MAX_DIST * 0.7) {
              const pct = (Math.sin(t * 3 + a.pulse) + 1) / 2;
              const sx = a.x + (b.x - a.x) * pct;
              const sy = a.y + (b.y - a.y) * pct;
              const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 3);
              grad.addColorStop(0, `rgba(120, 220, 255, 0.9)`);
              grad.addColorStop(1, `rgba(120, 220, 255, 0)`);
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(sx, sy, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        const glow = (Math.sin(n.pulse) + 1) / 2;
        const size = n.r * n.z * (1 + glow * 0.3);

        // Outer glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, size * 4);
        if (n.active) {
          gradient.addColorStop(0, `rgba(120, 220, 255, ${0.6 * n.z})`);
          gradient.addColorStop(0.5, `rgba(99, 102, 241, ${0.15 * n.z})`);
          gradient.addColorStop(1, `rgba(99, 102, 241, 0)`);
        } else {
          gradient.addColorStop(0, `rgba(99, 102, 241, ${0.5 * n.z})`);
          gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.1 * n.z})`);
          gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = n.active
          ? `rgba(120, 230, 255, ${0.9 * n.z})`
          : `rgba(165, 180, 252, ${0.8 * n.z})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mousemove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Floating 3D Neural Sphere (CSS 3D)
──────────────────────────────────────────────── */
function NeuralSphere({ style }) {
  return (
    <div
      className="neural-sphere-wrapper"
      style={{ position: "absolute", pointerEvents: "none", ...style }}
    >
      <div className="neural-sphere">
        {/* Latitude rings */}
        {[0, 30, 60, 90, 120, 150].map((deg, i) => (
          <div
            key={i}
            className="sphere-ring"
            style={{ transform: `rotateY(${deg}deg)` }}
          />
        ))}
        {/* Equator ring */}
        <div className="sphere-ring sphere-ring-h" />
        <div className="sphere-ring sphere-ring-h" style={{ transform: "rotateX(60deg)" }} />
        {/* Nodes on sphere */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const r = 60;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r * 0.4;
          return (
            <div
              key={i}
              className="sphere-node"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${Math.abs(y)}px)`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          );
        })}
        {/* Center core */}
        <div className="sphere-core" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Contact Form with Resend
──────────────────────────────────────────────── */
function ContactForm({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setProgress(0);
    setProgressStage("Initializing connection...");

    // Start sending progress animation
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 92) {
        currentProgress = 92;
        clearInterval(progressInterval);
      }
      setProgress(currentProgress);

      if (currentProgress < 25) {
        setProgressStage("Connecting to secure server gateway...");
      } else if (currentProgress < 50) {
        setProgressStage("Handshaking with Resend API routing...");
      } else if (currentProgress < 75) {
        setProgressStage("Encrypting contact message payload...");
      } else {
        setProgressStage("Transmitting packets to target mailboxes...");
      }
    }, 120);

    try {
      const startTime = Date.now();
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "admin@digitalmarketing.com",
          subject: subject || `New message from ${name}`,
          name,
          message,
          replyTo: email,
          type: "contact",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      // Complete progress smoothly
      clearInterval(progressInterval);
      setProgressStage("Email package transmitted successfully!");
      setProgress(100);

      // Give 800ms of visual buffer for showing 100% progress state
      const elapsed = Date.now() - startTime;
      const minDuration = 1200;
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
      }

      setStatus("success");
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backdropFilter: "blur(16px)", background: "rgba(10,8,30,0.65)" }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="contact-modal animate-modalIn"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          margin: "0 16px",
          background: "rgba(18,14,42,0.92)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 0 80px rgba(99,102,241,0.2), 0 24px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        {!loading && status !== "success" && (
          <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", display: "flex", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 16 }}>✉️</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Resend Powered
                </span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f7f7f4", margin: 0, letterSpacing: "-0.03em" }}>
                Send a Message
              </h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                We&apos;ll respond to your email directly
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                transition: "all 0.2s",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ─── 1. Loading / Progress State ─── */}
        {loading ? (
          <div className="animate-fadeIn" style={{ textAlign: "center", padding: "20px 0" }}>
            {/* Glowing active node animation */}
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "2px dashed rgba(99,102,241,0.4)",
                  animation: "spin 8s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "12%", left: "12%", right: "12%", bottom: "12%",
                  borderRadius: "50%",
                  border: "1px solid rgba(139,92,246,0.5)",
                  animation: "spin 4s linear infinite reverse",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "35%", left: "35%", width: "30%", height: "30%",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #78dbff 0%, #6366f1 70%)",
                  boxShadow: "0 0 20px #78dbff, 0 0 40px rgba(99,102,241,0.6)",
                  animation: "coreBreath 1.5s ease-in-out infinite",
                }}
              />
            </div>
            
            <p style={{ color: "#f7f7f4", fontSize: 14, fontWeight: 500, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {progressStage}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "0 0 20px", fontFamily: "monospace" }}>
              Progress: {progress}%
            </p>

            {/* Glowing Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 6,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6, #78dbff)",
                  borderRadius: 10,
                  transition: "width 0.2s ease-out",
                  boxShadow: "0 0 10px rgba(120,219,255,0.8)",
                }}
              />
            </div>

            {/* Stage Steps indicator */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, padding: "0 10px" }}>
              {[
                { label: "Connect", active: progress >= 25 },
                { label: "Encrypt", active: progress >= 50 },
                { label: "Resend Gateway", active: progress >= 75 },
                { label: "Transmit", active: progress === 100 },
              ].map((step, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: `2px solid ${step.active ? "#78dbff" : "rgba(255,255,255,0.15)"}`,
                      background: step.active ? "#6366f1" : "transparent",
                      boxShadow: step.active ? "0 0 8px rgba(120,219,255,0.5)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                  <span style={{ fontSize: 9, color: step.active ? "#a5b4fc" : "rgba(255,255,255,0.3)", fontWeight: step.active ? 600 : 400 }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : status === "success" ? (
          /* ─── 2. Custom Success Receipt UI ─── */
          <div className="animate-modalIn" style={{ textAlign: "center", padding: "12px 0" }}>
            {/* Success Shield Glow */}
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 24px" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.06)",
                  border: "2px solid rgba(16,185,129,0.25)",
                  boxShadow: "0 0 30px rgba(16,185,129,0.25)",
                  animation: "coreBreath 2s infinite alternate",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "15%", left: "15%", right: "15%", bottom: "15%",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  boxShadow: "0 0 20px rgba(16,185,129,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  color: "#fff",
                }}
              >
                ✓
              </div>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 600, color: "#f7f7f4", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              Securely Transmitted
            </h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.5 }}>
              Your query has been routed successfully via the <span style={{ color: "#a5b4fc", fontWeight: 600 }}>Resend API SMTP Server</span>.
            </p>

            {/* Custom transaction details block */}
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "16px",
                textAlign: "left",
                marginBottom: 28,
                fontSize: 12,
                fontFamily: "monospace",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>SENDER_NAME</span>
                <span style={{ color: "#f7f7f4" }}>{name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>REPLY_TO</span>
                <span style={{ color: "#f7f7f4", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>CONNECTION</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>SMTP_SECURE_TLS</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>TRANSMISSION</span>
                <span style={{ color: "#10b981" }}>200 OK (RESEND_ID)</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="signin-btn"
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
              }}
            >
              Acknowledge & Return
            </button>
          </div>
        ) : (
          /* ─── 3. Standard Message Form ─── */
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "#f7f7f4",
                    fontSize: 13,
                    outline: "none",
                    transition: "border 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "#f7f7f4",
                    fontSize: 13,
                    outline: "none",
                    transition: "border 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "#f7f7f4",
                  fontSize: 13,
                  outline: "none",
                  transition: "border 0.2s",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "rgba(165,180,252,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
                Message
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project or inquiry..."
                rows={4}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  color: "#f7f7f4",
                  fontSize: 13,
                  outline: "none",
                  resize: "none",
                  transition: "border 0.2s",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {status === "error" && (
              <p style={{ color: "#f87171", fontSize: 12, margin: 0, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>
                Failed to send. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="resend-btn"
              style={{
                width: "100%",
                background: loading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "1px solid rgba(99,102,241,0.5)",
                borderRadius: 12,
                padding: "12px",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.3s",
                letterSpacing: "-0.01em",
              }}
            >
              {loading ? (
                <>
                  <span className="spin-dot" />
                  Sending via Resend...
                </>
              ) : (
                <>
                  <span>Send Message</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Login Page
──────────────────────────────────────────────── */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        body, html {
          margin: 0; padding: 0;
          font-family: 'Inter', sans-serif;
          background: #060414;
        }

        /* ─── Neural Sphere CSS ─── */
        .neural-sphere-wrapper {
          width: 160px;
          height: 160px;
          perspective: 400px;
        }
        .neural-sphere {
          width: 160px;
          height: 160px;
          position: relative;
          transform-style: preserve-3d;
          animation: sphereRotate 14s linear infinite;
        }
        @keyframes sphereRotate {
          from { transform: rotateY(0deg) rotateX(15deg); }
          to   { transform: rotateY(360deg) rotateX(15deg); }
        }
        .sphere-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 130px; height: 130px;
          margin: -65px 0 0 -65px;
          border-radius: 50%;
          border: 1px solid rgba(99,102,241,0.35);
          transform-style: preserve-3d;
        }
        .sphere-ring-h {
          transform: rotateX(90deg) !important;
          border-color: rgba(139,92,246,0.3);
        }
        .sphere-node {
          position: absolute;
          top: 50%; left: 50%;
          width: 5px; height: 5px;
          margin: -2.5px 0 0 -2.5px;
          border-radius: 50%;
          background: radial-gradient(circle, #78dbff 0%, #6366f1 70%);
          box-shadow: 0 0 8px #78dbff, 0 0 16px rgba(99,102,241,0.6);
          animation: nodeGlow 2s ease-in-out infinite alternate;
          transform-style: preserve-3d;
        }
        @keyframes nodeGlow {
          from { opacity: 0.5; transform: scale(0.8) translate3d(var(--tx,0),var(--ty,0),0); }
          to   { opacity: 1;   transform: scale(1.2) translate3d(var(--tx,0),var(--ty,0),0); }
        }
        .sphere-core {
          position: absolute;
          top: 50%; left: 50%;
          width: 24px; height: 24px;
          margin: -12px 0 0 -12px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(120,219,255,0.9) 0%, rgba(99,102,241,0.5) 50%, transparent 80%);
          box-shadow: 0 0 24px rgba(120,219,255,0.8), 0 0 48px rgba(99,102,241,0.4);
          animation: coreBreath 3s ease-in-out infinite;
        }
        @keyframes coreBreath {
          0%, 100% { transform: scale(1); box-shadow: 0 0 24px rgba(120,219,255,0.8), 0 0 48px rgba(99,102,241,0.4); }
          50% { transform: scale(1.2); box-shadow: 0 0 36px rgba(120,219,255,1), 0 0 72px rgba(99,102,241,0.6); }
        }

        /* ─── Animations ─── */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(-2deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes particleDrift {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { opacity: 1; }
          100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }

        .animate-fadeIn { animation: fadeIn 0.5s ease-out both; }
        .animate-modalIn { animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }

        /* ─── Form input focus ─── */
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 12px;
          padding: 11px 14px;
          color: #f7f7f4;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border 0.25s, background 0.25s, box-shadow 0.25s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.22); }
        .login-input:focus {
          border-color: rgba(99,102,241,0.7);
          background: rgba(99,102,241,0.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }

        /* ─── Sign in button ─── */
        .signin-btn {
          position: relative;
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%);
          background-size: 200% 200%;
          border: none;
          border-radius: 13px;
          color: #fff;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          letter-spacing: -0.01em;
        }
        .signin-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          border-radius: inherit;
        }
        .signin-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.4);
          animation: gradientShift 2s ease infinite;
        }
        .signin-btn:active:not(:disabled) { transform: translateY(0); }
        .signin-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .resend-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.4);
        }

        /* ─── Spinner ─── */
        .spin-dot {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        /* ─── Floating particle ─── */
        .particle {
          position: absolute;
          border-radius: 50%;
          animation: particleDrift linear infinite;
          pointer-events: none;
        }

        /* ─── Glassmorphism card ─── */
        .glass-card {
          background: rgba(14,10,38,0.82);
          border: 1px solid rgba(99,102,241,0.22);
          border-radius: 22px;
          padding: 40px 36px;
          backdrop-filter: blur(32px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.08),
            0 32px 64px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.05);
          position: relative;
          overflow: hidden;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5) 40%, rgba(139,92,246,0.5) 60%, transparent);
        }

        /* ─── Scrollbar ─── */
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Neural Network Background Canvas */}
      <NeuralNetworkCanvas />

      {/* Deep space gradient background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.07) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(6,4,20,1) 0%, rgba(6,4,20,0.95) 100%)",
          zIndex: -1,
        }}
      />

      {/* Floating Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${10 + i * 8}%`,
            bottom: "-10px",
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background: i % 3 === 0 ? "#78dbff" : i % 3 === 1 ? "#6366f1" : "#a78bfa",
            animationDuration: `${5 + i * 1.2}s`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* ── Floating Neural Spheres ── */}
      <NeuralSphere
        style={{
          top: "12%",
          right: "8%",
          width: 160,
          height: 160,
          animation: "float1 8s ease-in-out infinite",
          opacity: 0.9,
        }}
      />
      <NeuralSphere
        style={{
          bottom: "15%",
          left: "6%",
          width: 110,
          height: 110,
          animation: "float2 10s ease-in-out infinite",
          opacity: 0.7,
          transform: "scale(0.7)",
        }}
      />
      <NeuralSphere
        style={{
          top: "60%",
          right: "15%",
          width: 80,
          height: 80,
          animation: "float3 7s ease-in-out infinite",
          opacity: 0.5,
          transform: "scale(0.5)",
        }}
      />

      {/* ── Decorative neural circuit lines ── */}
      <svg
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", opacity: 0.12 }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,200 Q400,150 800,300 T1440,200" stroke="url(#lineGrad)" fill="none" strokeWidth="1" />
        <path d="M0,600 Q350,500 700,650 T1440,550" stroke="url(#lineGrad)" fill="none" strokeWidth="1" />
        <path d="M200,0 Q300,300 250,600 T300,900" stroke="url(#lineGrad)" fill="none" strokeWidth="0.7" />
        <path d="M1200,0 Q1100,300 1150,600 T1100,900" stroke="url(#lineGrad)" fill="none" strokeWidth="0.7" />
      </svg>

      {/* ── Main content ── */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 16px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }} className="animate-fadeIn">

          {/* Logo & Heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                border: "1px solid rgba(99,102,241,0.4)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 18,
                boxShadow: "0 0 32px rgba(99,102,241,0.3)",
              }}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                style={{ borderRadius: 8, objectFit: "cover" }}
                priority
              />
            </div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: "#f7f7f4",
                margin: "0 0 8px",
                letterSpacing: "-0.04em",
                lineHeight: 1.2,
              }}
            >
              Digital Marketing
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #a5b4fc, #c4b5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Console
              </span>
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                margin: 0,
              }}
            >
              Neural Control Center
            </p>
          </div>

          {/* Glass Card */}
          <div className="glass-card">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 12,
                    color: "#fca5a5",
                  }}
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(165,180,252,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 8,
                  }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="login-input"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(165,180,252,0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 8,
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="login-input"
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(165,180,252,0.5)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: 0,
                      fontFamily: "inherit",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="signin-btn"
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span className="spin-dot" />
                    Authenticating...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    Sign In to Console
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "24px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(99,102,241,0.15)" }} />
            </div>

            {/* Contact via Resend */}
            <button
              onClick={() => setShowContact(true)}
              style={{
                width: "100%",
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 13,
                padding: "11px",
                color: "rgba(165,180,252,0.85)",
                fontSize: 12.5,
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 0.25s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.12)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us via Email
            </button>
          </div>

          {/* Footer */}
          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 10,
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            DMC &copy; {new Date().getFullYear()} &mdash; Neural Intelligence Platform
          </p>
        </div>
      </main>

      {/* Contact Form Modal */}
      {showContact && <ContactForm onClose={() => setShowContact(false)} />}
    </>
  );
}
