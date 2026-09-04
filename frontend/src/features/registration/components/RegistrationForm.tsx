"use client";

import {
  Camera,
  Check,
  Copy,
  MapPin,
  Phone,
  RefreshCw,
  Upload,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRegistration } from "../hooks/useRegistration";
import type { RegistrationForm as Form } from "../types/registration";

const plans = [
  {
    name: "Individual Student",
    label: "Individual Student (P850/month)",
    duration: 30,
    benefits: [
      "Free Trainer Assistance",
      "Experienced Coaches",
      "Clean & Safe Facility",
      "Top-Notch Equipment",
    ],
  },
  {
    name: "Individual Professional",
    label: "Individual Professional (P999/month)",
    duration: 30,
    benefits: [
      "Free Trainer Assistance",
      "Experienced Coaches",
      "Clean & Safe Facility",
      "Top-Notch Equipment",
    ],
  },
  {
    name: "Walk-in",
    label: "Walk-in (P199/session)",
    duration: 1,
    benefits: [
      "Single session access",
      "Clean & Safe Facility",
      "Top-Notch Equipment",
    ],
  },
  {
    name: "Barkada Group of 3 Professional",
    label: "Barkada Group of 3 Professional (P2697/month)",
    duration: 30,
    benefits: [
      "Free Body Fat Assessment",
      "Free Trainer Assistance",
      "Free Workout Program",
      "Unlimited Gym Access",
      "No Lock-in",
      "No Hidden Fees",
    ],
  },
  {
    name: "Barkada Group of 3 Student",
    label: "Barkada Group of 3 Student (P2250/month)",
    duration: 30,
    benefits: [
      "Free Body Fat Assessment",
      "Free Trainer Assistance",
      "Free Workout Program",
      "Unlimited Gym Access",
      "No Lock-in",
      "No Hidden Fees",
    ],
  },
  {
    name: "Barkada Group of 5 Professional",
    label: "Barkada Group of 5 Professional (P3995/month)",
    duration: 30,
    benefits: [
      "Free Body Fat Assessment",
      "Free Trainer Assistance",
      "Free Workout Program",
      "Unlimited Gym Access",
      "No Lock-in",
      "No Hidden Fees",
    ],
  },
  {
    name: "Barkada Group of 5 Student",
    label: "Barkada Group of 5 Student (P3250/month)",
    duration: 30,
    benefits: [
      "Free Body Fat Assessment",
      "Free Trainer Assistance",
      "Free Workout Program",
      "Unlimited Gym Access",
      "No Lock-in",
      "No Hidden Fees",
    ],
  },
  {
    name: "Barkada Group 6+ Professional",
    label: "Barkada Group 6+ Professional (P4194/month)",
    duration: 30,
    benefits: [
      "Free Body Fat Assessment",
      "Free Trainer Assistance",
      "Free Workout Program",
      "Unlimited Gym Access",
      "No Lock-in",
      "No Hidden Fees",
    ],
  },
  {
    name: "Barkada Group 6+ Student",
    label: "Barkada Group 6+ Student (P3600/month)",
    duration: 30,
    benefits: [
      "Free Body Fat Assessment",
      "Free Trainer Assistance",
      "Free Workout Program",
      "Unlimited Gym Access",
      "No Lock-in",
      "No Hidden Fees",
    ],
  },
] as const;

type RegistrationFormProps = {
  onPreviewChange?: (form: Form, expiry: string) => void;
  onRegistered?: (form: Form) => void;
};

export function RegistrationForm({
  onPreviewChange,
  onRegistered,
}: RegistrationFormProps) {
  const { loading, message, submit } = useRegistration();
  const [form, setForm] = useState<Form>({
    fullName: "",
    memberId: "",
    contact: "",
    address: "",
    packageName: plans[0].name,
    packageDays: String(plans[0].duration),
  });
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [picturePreview, setPicturePreview] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [registeredAt, setRegisteredAt] = useState(() => new Date());
  const update = (key: keyof Form, value: string | File) =>
    setForm((current) => ({ ...current, [key]: value }));
  const selectedPlan =
    plans.find((plan) => plan.name === form.packageName) ?? plans[0];
  const expiry = useMemo(() => {
    const date = new Date(registeredAt);
    date.setDate(date.getDate() + Math.max(1, Number(form.packageDays) || 1));
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [form.packageDays, registeredAt]);
  useEffect(() => {
    onPreviewChange?.(form, expiry);
  }, [expiry, form, onPreviewChange]);
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );
  useEffect(() => {
    if (!form.picture) {
      setPicturePreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(form.picture);
    setPicturePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [form.picture]);
  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not available in this browser.");
      return;
    }
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setCameraError(
        "Camera access was blocked. Allow camera permission and try again.",
      );
    }
  };
  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          update(
            "picture",
            new File([blob], "webcam-snapshot.jpg", { type: "image/jpeg" }),
          );
          closeCamera();
        }
      },
      "image/jpeg",
      0.9,
    );
  };
  const selectPlan = (name: string) => {
    const plan = plans.find((item) => item.name === name) ?? plans[0];
    setForm((current) => ({
      ...current,
      packageName: plan.name,
      packageDays: String(plan.duration),
    }));
  };
  const regenerate = () =>
    update("memberId", `AM-${Math.floor(10000 + Math.random() * 90000)}`);
  const copyId = () => navigator.clipboard?.writeText(form.memberId);
  return (
    <form
      className="reference-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const registered = await submit(form);
        if (registered) {
          setRegisteredAt(new Date());
          onRegistered?.(form);
        }
      }}
    >
      <div className="form-panels">
        <section className="identity-card form-card">
          <div className="form-card-heading">
            <h2>
              <UserRound size={16} /> 1. Identity &amp; Biometrics
            </h2>
            <span>Primary ID</span>
          </div>
          <div className="photo-zone">
            <div className="photo-avatar">
              {picturePreview ? (
                <img src={picturePreview} alt="Member profile preview" />
              ) : (
                form.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .join("") || "ER"
              )}
            </div>
            <div className="photo-actions">
              <button type="button" onClick={startCamera}>
                <Camera size={13} /> Webcam Snap
              </button>
              <label>
                <Upload size={13} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) update("picture", file);
                  }}
                />
              </label>
            </div>
            {cameraOpen && (
              <div className="camera-panel">
                <video ref={videoRef} autoPlay playsInline muted />
                <div>
                  <button type="button" onClick={capturePhoto}>
                    <Camera size={13} /> Capture
                  </button>
                  <button type="button" onClick={closeCamera}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {cameraError && (
              <small className="camera-error">{cameraError}</small>
            )}
          </div>
          <label>
            Full Legal Name <em>*</em>
            <span className="input-wrap">
              <UserRound size={14} />
              <input
                required
                value={form.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                placeholder="Enter Name"
              />
            </span>
          </label>
          <label>
            Unique Member ID <em>*</em>
            <button type="button" className="field-link" onClick={regenerate}>
              <RefreshCw size={11} /> Regenerate
            </button>
            <span className="input-wrap">
              <input
                required
                value={form.memberId}
                onChange={(event) => update("memberId", event.target.value)}
                placeholder="e.g. 2401940"
              />
              <button type="button" onClick={copyId}>
                <Copy size={11} /> Copy
              </button>
            </span>
          </label>
          <label>
            Direct Contact Number <em>*</em>
            <span className="input-wrap">
              <Phone size={14} />
              <input
                required
                value={form.contact}
                onChange={(event) => update("contact", event.target.value)}
                placeholder="e.g. 09307847716"
              />
            </span>
          </label>
          <label>
            Physical Address <em>*</em>
            <span className="input-wrap">
              <MapPin size={14} />
              <input
                required
                value={form.address}
                onChange={(event) => update("address", event.target.value)}
                placeholder="Street, city, province"
              />
            </span>
          </label>
        </section>
        <section className="package-card form-card">
          <div className="form-card-heading">
            <h2>
              <span className="medal">♜</span> 2. Package &amp; Entitlements
            </h2>
            <span className="tier">Tier</span>
          </div>
          <label>
            Membership Tier &amp; Plan <em>*</em>
            <select
              value={form.packageName}
              onChange={(event) => selectPlan(event.target.value)}
            >
              {plans.map((plan) => (
                <option value={plan.name} key={plan.name}>
                  {plan.label}
                </option>
              ))}
            </select>
          </label>
          <div className="duration-heading">
            <label>Package Duration (Days)</label>
            <small>(Automatically set by package, editable)</small>
            <strong>
              {selectedPlan.duration === 1
                ? "Single Session"
                : "Monthly Standard"}
            </strong>
          </div>
          <div className="duration-input">
            <input
              className="automatic-duration"
              aria-label="Package duration in days"
              type="number"
              min="1"
              value={form.packageDays}
              onChange={(event) => update("packageDays", event.target.value)}
            />
          </div>
          <div className="package-summary expiry-only">
            <div>
              <span>Calculated expiry</span>
              <b>{expiry}</b>
            </div>
          </div>
          <div className="benefits-heading">
            <strong>Package included benefits</strong>
            <b>{selectedPlan.benefits.length} Benefits Active</b>
          </div>
          <div className="benefits">
            {selectedPlan.benefits.map((benefit) => (
              <span key={benefit}>
                <Check size={12} /> {benefit}
              </span>
            ))}
          </div>
        </section>
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            setForm((current) => ({
              ...current,
              fullName: "",
              memberId: "",
              contact: "",
              address: "",
            }))
          }
        >
          Reset Form
        </button>
        <button type="button" className="secondary-button">
          ☆ Save Draft
        </button>
        <div className="activation">
          <small>Standard Activation</small>
          <b>Immediate Clearance</b>
        </div>
        <button className="primary-button" disabled={loading}>
          <UserRound size={16} />{" "}
          {loading ? "Registering..." : "Register & Issue Pass"}
        </button>
      </div>
      {message && (
        <p
          className={
            message.includes("created") ? "success-message" : "error-message"
          }
        >
          {message}
        </p>
      )}
    </form>
  );
}
