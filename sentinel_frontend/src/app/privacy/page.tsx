import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-[800px] mx-auto bg-white border border-slate-200 rounded-[24px] p-10 md:p-16 shadow-sm">
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="max-w-none text-slate-600 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h3>
            <p>Welcome to SentinelAI. We respect your privacy and are committed to protecting your personal data and machine identity information. This privacy policy will inform you as to how we look after your data when you visit our website or use our cloud identity security platform.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Data We Collect</h3>
            <p>To provide our services, SentinelAI collects and processes metadata, CloudTrail logs, IAM configurations, and usage analytics. We do not store sensitive credentials or plaintext secrets. We focus exclusively on the metadata required to map attack paths and identify risk anomalies.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Data</h3>
            <p>We use your data strictly to provide, improve, and secure the SentinelAI platform. This includes:</p>
            <ul className="list-disc pl-5 my-4 space-y-2">
              <li>Ingesting CloudTrail logs to discover machine identities.</li>
              <li>Generating graph-based threat models.</li>
              <li>Powering our AI Security Analyst Copilot to answer your security queries.</li>
            </ul>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h3>
            <p>We have put in place robust enterprise-grade security measures to prevent your data from being accidentally lost, used, or accessed in an unauthorized way. Data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Contact Us</h3>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact our Data Protection Officer at privacy@sentinelai.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
