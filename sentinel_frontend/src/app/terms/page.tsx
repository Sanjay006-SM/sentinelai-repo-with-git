import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-[800px] mx-auto bg-white border border-slate-200 rounded-[24px] p-10 md:p-16 shadow-sm">
          <h1 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500 mb-10">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="max-w-none text-slate-600 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h3>
            <p>By accessing or using the SentinelAI platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Enterprise License</h3>
            <p>Subject to these Terms and the payment of applicable fees, SentinelAI grants you a non-exclusive, non-transferable license to use the platform for your internal security monitoring and threat detection purposes.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Acceptable Use</h3>
            <p>You agree not to use the Service in any way that causes, or may cause, damage to the Service or impairment of the availability or accessibility of the Service. Reverse engineering, decompiling, or attempting to extract the source code of the platform is strictly prohibited.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. AI and Graph Processing</h3>
            <p>SentinelAI uses artificial intelligence and graph databases to analyze log data. While we strive for extreme accuracy in identifying attack paths and risk anomalies, you acknowledge that AI-generated insights should be verified by your security operations center (SOC) before taking destructive remediation actions.</p>
            
            <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Limitation of Liability</h3>
            <p>In no event shall SentinelAI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
