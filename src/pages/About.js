import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen relative overflow-hidden px-4 py-12 about-atmosphere">
      <div className="about-float about-float-a h-56 w-56 bg-cyan-300/45 -top-8 -left-10" />
      <div className="about-float about-float-b h-72 w-72 bg-amber-300/35 top-20 -right-18" />
      <div className="about-float about-float-c h-64 w-64 bg-emerald-300/28 bottom-8 left-1/3" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="glass-panel rounded-[2rem] p-6 md:p-10 panel-pop soft-glow">
          <div className="text-center mb-10 reveal-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 text-sm font-semibold text-slate-600 mb-5 shadow-sm motion-sheen">
              <span>✨</span>
              <span>About Jan-Kawach</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold brand-gradient-text mb-4">
              A safer community, built for action
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Jan-Kawach combines reporting, evidence protection, QR safety, and live alerts into one coordinated platform for community safety.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <div className="bg-white/80 border border-slate-200 rounded-3xl p-5 hover-lift stagger-item soft-glow">
              <div className="text-3xl mb-3">🧾</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Report with confidence</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                File complaints, attach evidence, and generate structured records for follow-up and verification.
              </p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-3xl p-5 hover-lift stagger-item soft-glow">
              <div className="text-3xl mb-3">🗂️</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Protect your evidence</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Keep sensitive files in an encrypted vault with a clean workflow for reviewing, uploading, and tracking files.
              </p>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-3xl p-5 hover-lift stagger-item soft-glow">
              <div className="text-3xl mb-3">🕵️</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Verify threats fast</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Check blacklisted numbers, emails, or URLs and see how the community is actively protecting itself.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 panel-pop">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">What you can do</h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-3"><span>•</span><span>Create community posts and share updates, optionally anonymously.</span></li>
                <li className="flex gap-3"><span>•</span><span>File complaints with attachments and generate a PDF summary for each complaint.</span></li>
                <li className="flex gap-3"><span>•</span><span>Validate QR codes using your camera or uploaded images, with link safety checks.</span></li>
                <li className="flex gap-3"><span>•</span><span>Store sensitive files securely in an encrypted e-Vault accessible only to you.</span></li>
                <li className="flex gap-3"><span>•</span><span>Receive real-time alerts for reported entities via live notifications.</span></li>
              </ul>
            </section>

            <section className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 panel-pop">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">How to use</h2>
              <ol className="space-y-3 text-slate-700 list-decimal list-inside">
                <li>Sign up or log in from the Auth page to access protected features.</li>
                <li>Open Posts to share or read community updates.</li>
                <li>Use Complaint to file a report and attach evidence if needed.</li>
                <li>Use Validate QR to scan a code and check whether the link is safe.</li>
                <li>Open Vault to upload and manage encrypted files securely.</li>
              </ol>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <section className="bg-white/80 border border-cyan-100 rounded-3xl p-6 soft-glow panel-pop">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Privacy & Security</h2>
              <p className="text-slate-600 mb-4 leading-relaxed">The platform is designed to keep your activity protected while still making reporting easy.</p>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-3"><span>•</span><span>Authentication uses JWT tokens, so keep your token private.</span></li>
                <li className="flex gap-3"><span>•</span><span>Vault files are encrypted on the server before they are stored.</span></li>
                <li className="flex gap-3"><span>•</span><span>QR links can be scanned via VirusTotal when the server key is configured.</span></li>
              </ul>
            </section>

            <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 panel-pop">
              <h2 className="text-xl font-semibold mb-4">Need help or feedback?</h2>
              <p className="text-slate-200 leading-relaxed mb-6">
                If you find bugs or want to suggest features, open an issue in the repository or contact support@example.com.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-5 py-3 rounded-2xl hover:-translate-y-0.5 transition-transform shadow-lg motion-sheen"
                aria-label="Back to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
