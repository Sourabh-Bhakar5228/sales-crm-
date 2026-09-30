import { useEffect, useState, type FormEvent, useRef } from "react";
import LeadTable from "../../components/leads/LeadTable";
import Modal from "../../components/common/Modal";
import { getLeads, updateVigilance, uploadAudio, verifyLead } from "../../api/leads.api";
import type { Lead } from "../../types/lead";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Lock } from "lucide-react";

export default function VigilanceLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [name, setName] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [remark, setRemark] = useState("");

  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleOpenVigilanceModal = (lead: Lead) => {
    setSelectedLead(lead);
    setName(lead.name);
    setPostalAddress(lead.postalAddress || "");
    setDate(lead.date ? new Date(lead.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    setTime(lead.time || "14:00");
    setRemark(lead.remark || "");
    setSelectedAudioFile(null);
    setError("");
  };

  const handleUpdateDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setError("");

    try {
      const updated = await updateVigilance(selectedLead._id, {
        name: name.trim(),
        postalAddress: postalAddress.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        remark: remark.trim() || undefined,
      });
      setSelectedLead(updated);
      setSuccessMsg("Meeting details updated by Vigilance!");
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  const handleUploadAudio = async () => {
    if (!selectedLead || !selectedAudioFile) return;
    setError("");
    setUploadingAudio(true);

    try {
      const updated = await uploadAudio(selectedLead._id, selectedAudioFile);
      setSelectedLead(updated);
      setSelectedAudioFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMsg("Call recording uploaded to Cloudinary successfully!");
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedLead) return;
    setError("");

    if (!selectedLead.audio?.url) {
      setError("Audio recording is mandatory before verification!");
      return;
    }

    try {
      setVerifying(true);
      await verifyLead(selectedLead._id);
      setSelectedLead(null);
      setSuccessMsg(`Lead ${selectedLead.name} successfully VERIFIED!`);
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Vigilance & Audio Verification</h2>
        <p className="text-xs text-slate-500">
          Inspect customer call recording and verify details. Moves lead from{" "}
          <span className="font-semibold text-amber-600">MEETING</span> ➔{" "}
          <span className="font-semibold text-emerald-600">VERIFIED</span>.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Leads Table */}
      <LeadTable
        leads={leads}
        loading={loading}
        actionLabel="Process & Verify"
        actionIcon={<ShieldCheck size={14} />}
        onAction={handleOpenVigilanceModal}
      />

      {/* Vigilance Action Modal */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title="Vigilance Verification & Audio Upload"
        subtitle={`Audit customer recording and confirm details for ${selectedLead?.name}`}
        maxWidth="lg"
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Lead Details (Editable except contact) */}
          <form onSubmit={handleUpdateDetails} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Meeting Details</h4>
              <button
                type="submit"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Save Details
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                  Contact Number
                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-0.5">
                    <Lock size={9} /> Locked
                  </span>
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedLead?.contactNumber || ""}
                  className="w-full font-mono rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Postal Address</label>
              <textarea
                rows={2}
                value={postalAddress}
                onChange={(e) => setPostalAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                />
              </div>
            </div>
          </form>

          {/* Section 2: Audio Upload / Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Customer Call Audio Recording 🎙️
            </h4>

            {selectedLead?.audio?.url ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Recording Uploaded to Cloudinary
                  </span>
                  <span className="text-[11px] text-emerald-600 font-mono">
                    {selectedLead.audio.fileName}
                  </span>
                </div>
                <audio
                  controls
                  src={selectedLead.audio.url}
                  className="w-full h-8"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 text-xs text-amber-800">
                ⚠ Audio is missing! You cannot verify this lead without uploading the customer call recording.
              </div>
            )}

            {/* File input for upload or replace */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedAudioFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
              />
              <button
                type="button"
                onClick={handleUploadAudio}
                disabled={!selectedAudioFile || uploadingAudio}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black transition disabled:opacity-40"
              >
                <Upload size={13} />
                {uploadingAudio ? "Uploading..." : selectedLead?.audio?.url ? "Replace Audio" : "Upload Audio"}
              </button>
            </div>
          </div>

          {/* Section 3: Verify Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Prerequisite: Audio recording required
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={!selectedLead?.audio?.url || verifying}
                title={!selectedLead?.audio?.url ? "Audio upload required first" : "Verify Lead"}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShieldCheck size={14} />
                {verifying ? "Verifying..." : "Verify Lead (VERIFIED)"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
