import { Shield, Flag, Clock } from "lucide-react";

export function AdminReports() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-white/40 text-sm mt-1">User-submitted content reports</p>
      </div>

      <div className="bg-[#0d1b2a] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00FF9D]/10 border border-[#00FF9D]/20 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-[#00FF9D]" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Content Reports</h3>
        <p className="text-white/40 text-sm max-w-sm leading-relaxed mb-6">
          When students flag discussions or questions for review, they will appear here. No reports have been submitted yet.
        </p>
        <div className="flex gap-6 text-center">
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Flag className="w-3.5 h-3.5 text-[#00FF9D]" />
              <span className="text-white/40 text-xs">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Shield className="w-3.5 h-3.5 text-[#00FF9D]" />
              <span className="text-white/40 text-xs">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/40 text-xs">Dismissed</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
