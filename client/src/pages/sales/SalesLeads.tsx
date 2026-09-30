import { useEffect, useState, useRef } from "react";
import LeadTable from "../../components/leads/LeadTable";
import Modal from "../../components/common/Modal";
import { getLeads, markAudioCompleted, claimLead } from "../../api/leads.api";
import type { Lead } from "../../types/lead";
import { Headphones, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Calendar, Clock, Lock } from "lucide-react";

export default function SalesLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [recordingPlayback, setRecordingPlayback] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleOpenLeadModal = (lead: Lead) => {
    setSelectedLead(lead);
    setAudioCompleted(Boolean(lead.audioCompletedAt));
    setError("");
  };

  const handleAudioEnded = async () => {
    if (!selectedLead) return;
    try {
      setRecordingPlayback(true);
      const updated = await markAudioCompleted(selectedLead._id);
      setSelectedLead(updated);
      setAudioCompleted(true);
      setSuccessMsg("Audio completed! You are now authorized to Claim this lead.");
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record audio completion");
    } finally {
      setRecordingPlayback(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedLead || !audioCompleted) return;
    setError("");

    try {
      setClaiming(true);
      await claimLead(selectedLead._id);
      setSelectedLead(null);
      setSuccessMsg("Lead claimed successfully! Lead is now in terminal CLAIMED state.");
      fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Sales Lead Playback & Claim</h2>
        <p className="text-xs text-slate-500">
          Listen to the full customer call audio to verify requirements and claim ownership. Transitions leads from{" "}
          <span className="font-semibold text-purple-600">ALLOCATED</span> ➔{" "}
          <span className="font-semibold text-rose-600">CLAIMED</span>.
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
        actionLabel="Listen & Claim"
        actionIcon={<Headphones size={14} />}
        onAction={handleOpenLeadModal}
      />

      {/* Audio Playback & Claim Modal */}
      <Modal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        title="Customer Call Verification & Claim"
        subtitle={`Mandatory audio playback before claiming ${selectedLead?.name}`}
        maxWidth="lg"
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
            <AlertTriangle size={15} />
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Customer Details Summary */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lead Record</span>
              <span className="font-mono text-[11px] text-slate-400">ID: {selectedLead?._id}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[11px] text-slate-500">Customer Name</p>
                <p className="font-semibold text-slate-900">{selectedLead?.name}</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  Contact Number
                  <Lock size={10} className="text-slate-400" />
                </p>
                <p className="font-mono font-semibold text-slate-900">{selectedLead?.contactNumber}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/50">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin size={11} className="text-slate-400" />
                Meeting Address
              </p>
              <p className="font-medium text-slate-800">{selectedLead?.postalAddress || "No address provided"}</p>
            </div>

            <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar size={11} className="text-slate-400" />
                {selectedLead?.date ? new Date(selectedLead.date).toLocaleDateString() : "No date"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-slate-400" />
                {selectedLead?.time || "No time"}
              </span>
            </div>
          </div>

          {/* Audio Player Card with Anti-Bypass Guard */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Headphones size={15} className="text-indigo-600" />
                Mandatory Call Recording Playback
              </h4>
              {audioCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={13} />
                  Playback Complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <AlertTriangle size={13} />
                  Listen Till End Required
                </span>
              )}
            </div>

            {selectedLead?.audio?.url ? (
              <div className="space-y-3 pt-1">
                <audio
                  ref={audioRef}
                  controls
                  preload="metadata"
                  src={selectedLead.audio.url}
                  onEnded={handleAudioEnded}
                  className="w-full"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>File: {selectedLead.audio.fileName}</span>
                  {selectedLead.audioCompletedAt && (
                    <span>Verified at: {new Date(selectedLead.audioCompletedAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">
                No recording found for this lead.
              </div>
            )}
          </div>

          {/* Claim Action */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {audioCompleted ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Ready for claim!
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  {recordingPlayback ? "Recording playback verification..." : "Claim locked until audio completes."}
                </span>
              )}
            </div>

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
                onClick={handleClaim}
                disabled={!audioCompleted || claiming}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-700 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShieldCheck size={14} />
                {claiming ? "Claiming Lead..." : "Claim Lead (CLAIMED)"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
