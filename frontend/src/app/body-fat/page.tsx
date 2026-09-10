"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Calculator, Download, UserRound } from "lucide-react";
import type { MemberStatus } from "@/features/check-in/types/status";
import { fetchMembers } from "@/features/enrollments/services/enrollmentsApi";

export default function BodyFatPage() {
  const [memberId, setMemberId] = useState("");
  const [members, setMembers] = useState<MemberStatus[]>([]);
  const [weightInput, setWeightInput] = useState<number | "">("");
  const [heightInput, setHeightInput] = useState<number | "">("");
  const [ageInput, setAgeInput] = useState<number | "">("");
  const [sex, setSex] = useState<"female" | "male" | "">("");
  const [neckInput, setNeckInput] = useState<number | "">("");
  const [waistInput, setWaistInput] = useState<number | "">("");
  const [hipInput, setHipInput] = useState<number | "">("");
  const [calipers, setCalipers] = useState<Record<string, number | "">>({ chestLeft: "", chestRight: "", midaxillaryLeft: "", midaxillaryRight: "", tricepsLeft: "", tricepsRight: "", subscapularLeft: "", subscapularRight: "", abdomenLeft: "", abdomenRight: "", suprailiacLeft: "", suprailiacRight: "", thighLeft: "", thighRight: "" });
  const [calculated, setCalculated] = useState(false);
  const [today, setToday] = useState("—");

  useEffect(() => {
    setMemberId(new URLSearchParams(window.location.search).get("memberId") ?? "");
    setToday(new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    fetchMembers()
      .then((data) => setMembers(data))
      .catch(() => setMembers([]));
  }, []);

  const member = useMemo(() => members.find((item) => item.member.memberId === memberId) ?? members[0], [memberId, members]);
  const weight = Number(weightInput);
  const height = Number(heightInput);
  const age = Number(ageInput);
  const neck = Number(neckInput);
  const waist = Number(waistInput);
  const hip = Number(hipInput);
  const hasInputs = sex !== "" && [weightInput, heightInput, ageInput, neckInput, waistInput, hipInput, ...Object.values(calipers)].every((value) => value !== "" && Number(value) > 0);
  const numericWeight = weight;
  const numericHeight = height;
  const numericAge = age;
  const numericNeck = neck;
  const numericWaist = waist;
  const numericHip = hip;
  const bmi = hasInputs ? numericWeight / ((numericHeight / 100) ** 2) : 0;
  const bodyFat = hasInputs ? (sex === "male"
    ? 495 / (1.0324 - 0.19077 * Math.log10(Math.max(numericWaist - numericNeck, 1)) + 0.15456 * Math.log10(numericHeight)) - 450
    : 495 / (1.29579 - 0.35004 * Math.log10(Math.max(numericWaist + numericHip - numericNeck, 1)) + 0.221 * Math.log10(numericHeight)) - 450) : 0;
  const fatMass = numericWeight * Math.max(bodyFat, 0) / 100;
  const leanMass = numericWeight - fatMass;
  const outputReady = calculated && hasInputs;
  const calculate = (event: React.FormEvent) => { event.preventDefault(); if (hasInputs) setCalculated(true); };
  const setCaliper = (key: keyof typeof calipers) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setCalipers((current) => ({ ...current, [key]: event.target.value === "" ? "" : Number(event.target.value) }));
  const exportCsv = () => {
    const csv = `Assessment Date,Member,Scale Mass,Body Fat %,Lean Mass (LBM)\n${today},${member?.member.fullName ?? "Member"},${weight.toFixed(1)} kg,${bodyFat.toFixed(1)}%,${leanMass.toFixed(1)} kg`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "body-fat-assessment.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className="body-fat-page">
      <header className="body-fat-header">
        <a href="/enrollments" className="body-fat-back"><ArrowLeft size={16} /> Back to Enrollments</a>
        <div><img src="/sams-slim-gym-logo.png" alt="Sam's Slim Gym" /><strong>Sam's Slim Gym</strong><small>Biometric Assessment</small></div>
      </header>
      <section className="body-fat-title"><div><span><BadgeCheck size={15} /> MEMBER HEALTH TOOLS</span><h1>Body Fat Assessment</h1><p>Calculate body composition and track progress over time.</p></div><div className="body-fat-member"><UserRound size={17} /> {member?.member.fullName ?? "Select a member"}</div></section>

      <section className="body-fat-grid">
        <form className="assessment-card" onSubmit={calculate}>
          <div className="assessment-card-heading"><div><small>MEMBER MEASUREMENTS</small><h2>Body composition inputs</h2></div><b>Metric (cm / kg)</b></div>
          <div className="field-grid two"><label>Gender profile<select value={sex} onChange={(event) => setSex(event.target.value as "female" | "male" | "")}><option value="">Select gender</option><option value="female">♀ Female</option><option value="male">♂ Male</option></select></label><label>Age (years)<input type="number" min="1" max="120" value={ageInput} onChange={(event) => setAgeInput(event.target.value === "" ? "" : Number(event.target.value))} /><em>yrs</em></label></div>
          <div className="field-grid two"><label>Height (standing)<input type="number" min="1" step="0.1" value={heightInput} onChange={(event) => setHeightInput(event.target.value === "" ? "" : Number(event.target.value))} /><em>cm</em></label><label>Current body mass<input type="number" min="1" step="0.1" value={weightInput} onChange={(event) => setWeightInput(event.target.value === "" ? "" : Number(event.target.value))} /><em>kg</em></label></div>
          <div className="field-grid two"><label>Neck circumference<input type="number" min="1" step="0.1" value={neckInput} onChange={(event) => setNeckInput(event.target.value === "" ? "" : Number(event.target.value))} /><em>cm</em></label><label>Waist circumference<input type="number" min="1" step="0.1" value={waistInput} onChange={(event) => setWaistInput(event.target.value === "" ? "" : Number(event.target.value))} /><em>cm</em></label></div>
          <div className="field-grid one"><label>Hip circumference<input type="number" min="1" step="0.1" value={hipInput} onChange={(event) => setHipInput(event.target.value === "" ? "" : Number(event.target.value))} /><em>cm</em></label></div>
          <div className="caliper-section"><div className="caliper-heading"><span>SKINFOLD CALIPER MEASUREMENTS</span><small>Jackson-Pollock 7-site · left and right · millimeters</small></div><div className="field-grid two"><label>Chest — left<input type="number" min="0" step="0.1" value={calipers.chestLeft} onChange={setCaliper("chestLeft")} /><em>mm</em></label><label>Chest — right<input type="number" min="0" step="0.1" value={calipers.chestRight} onChange={setCaliper("chestRight")} /><em>mm</em></label><label>Midaxillary — left<input type="number" min="0" step="0.1" value={calipers.midaxillaryLeft} onChange={setCaliper("midaxillaryLeft")} /><em>mm</em></label><label>Midaxillary — right<input type="number" min="0" step="0.1" value={calipers.midaxillaryRight} onChange={setCaliper("midaxillaryRight")} /><em>mm</em></label><label>Triceps — left<input type="number" min="0" step="0.1" value={calipers.tricepsLeft} onChange={setCaliper("tricepsLeft")} /><em>mm</em></label><label>Triceps — right<input type="number" min="0" step="0.1" value={calipers.tricepsRight} onChange={setCaliper("tricepsRight")} /><em>mm</em></label><label>Subscapular — left<input type="number" min="0" step="0.1" value={calipers.subscapularLeft} onChange={setCaliper("subscapularLeft")} /><em>mm</em></label><label>Subscapular — right<input type="number" min="0" step="0.1" value={calipers.subscapularRight} onChange={setCaliper("subscapularRight")} /><em>mm</em></label><label>Abdominal — left<input type="number" min="0" step="0.1" value={calipers.abdomenLeft} onChange={setCaliper("abdomenLeft")} /><em>mm</em></label><label>Abdominal — right<input type="number" min="0" step="0.1" value={calipers.abdomenRight} onChange={setCaliper("abdomenRight")} /><em>mm</em></label><label>Suprailiac — left<input type="number" min="0" step="0.1" value={calipers.suprailiacLeft} onChange={setCaliper("suprailiacLeft")} /><em>mm</em></label><label>Suprailiac — right<input type="number" min="0" step="0.1" value={calipers.suprailiacRight} onChange={setCaliper("suprailiacRight")} /><em>mm</em></label><label>Thigh — left<input type="number" min="0" step="0.1" value={calipers.thighLeft} onChange={setCaliper("thighLeft")} /><em>mm</em></label><label>Thigh — right<input type="number" min="0" step="0.1" value={calipers.thighRight} onChange={setCaliper("thighRight")} /><em>mm</em></label></div></div>
          <div className="assessment-note">⚠ Standardized tape tension notice<br /><small>Apply constant 0.5 lb spring tension. Take three non-consecutive readings per site and average the result.</small></div>
          <button className="calculate-button" type="submit"><Calculator size={16} /> Calculate Biometrics &amp; Recomposition Stats</button>
        </form>

        <aside className="output-card"><div className="output-heading"><div><small>BIOMETRIC ASSESSMENT OUTPUT</small><span>Evaluated: {calculated ? today : "Not yet calculated"}</span></div><b>{bodyFat.toFixed(1)}% <small>BF</small></b></div><p className="formula">U.S. Navy Aพromedical Formula</p><div className="fitness-badge">◉ Fitness / Optimal</div><div className="spectrum"><div><i style={{ left: `${Math.min(92, Math.max(8, bodyFat * 2.8))}%` }} /></div><small>Essential　 Athletes　 Fitness　 Acceptable　 Overweight</small></div><div className="metric-grid"><div><small>FAT MASS (FM)</small><strong>{fatMass.toFixed(1)} kg</strong><span>Adipose store</span></div><div><small>LEAN BODY MASS</small><strong>{leanMass.toFixed(1)} kg</strong><span>Muscle, bone &amp; organ</span></div><div><small>BMI INDEX</small><strong>{bmi.toFixed(1)}</strong><span>Normal weight range</span></div><div><small>BASAL METABOLIC RATE</small><strong>{Math.round(10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161)).toLocaleString()}</strong><span>kcal / day resting</span></div></div><div className="burn-card">🔥 <span>Estimated Daily Burn (TDEE)<small>Maintenance at Moderately Active</small></span><strong>{Math.round((10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161)) * 1.45).toLocaleString()}<small>kcal / day</small></strong></div></aside>
      </section>

      <section className="history-card"><div className="history-heading"><div><h2>📈 {member?.member.fullName ?? "Member"}'s Recomposition Timeline</h2><p>Track assessment history and body composition changes.</p></div><button type="button" onClick={exportCsv}><Download size={14} /> Export CSV</button></div><table><thead><tr><th>ASSESSMENT DATE</th><th>SCALE MASS</th><th>BODY FAT %</th><th>LEAN MASS (LBM)</th><th>ASSESSOR</th><th>PROGRESS DELTA</th></tr></thead><tbody><tr><td>● {today} <b>Latest</b></td><td>{weight.toFixed(1)} kg</td><td>{bodyFat.toFixed(1)}%</td><td>{leanMass.toFixed(1)} kg</td><td>Sam's Slim Gym</td><td>Baseline Scan</td></tr></tbody></table></section>
      <section className="inline-history"><div className="history-heading"><div><h2>Recomposition Timeline</h2><p>Track body-fat changes over time.</p></div><button type="button" onClick={exportCsv}><Download size={14} /> Export CSV</button></div><table><thead><tr><th>ASSESSMENT DATE</th><th>BODY FAT %</th></tr></thead><tbody><tr><td>{today} <b>Latest</b></td><td>{bodyFat.toFixed(1)}%</td></tr></tbody></table></section>
    </main>
  );
}
