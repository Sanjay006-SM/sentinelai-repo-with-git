"use client";

export default function ProblemSection() {
  const problems = [
    {
      image: "/images/cards/sprawl_clean.png",
      title: "Machine Identity Sprawl",
      desc1: "Organizations have thousands of compute instances, serverless tasks, and service keys.",
      desc2: "Over-privileged machine roles outnumber human users 10-to-1."
    },
    {
      image: "/images/cards/fatigue_clean.png",
      title: "Alert Fatigue",
      desc1: "CloudTrail logs generate millions of API events daily.",
      desc2: "Sifting through noise manually to isolate suspicious IAM actions is a mathematical impossibility."
    },
    {
      image: "/images/cards/attack_paths_clean.png",
      title: "Invisible Attack Paths",
      desc1: "Attackers don't exploit a single critical CVE; they chain minor IAM assume-role policies to quietly access keys and data stores.",
      desc2: "These paths remain hidden."
    }
  ];

  return (
    <section id="company" className="w-full py-20 md:py-28 bg-white border-y border-slate-200 z-10 relative">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-pink-700 text-xs font-semibold tracking-wider bg-pink-50 border border-pink-200/60 mb-4 uppercase">
            THE IDENTITY CRISIS
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-[#1E0E34] mb-4 tracking-tight">
            Why Traditional Monitoring Fails Cloud Identities
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Traditional security tools flag individual compliance checks. SentinelAI discovers how they chain together to create real threats.
          </p>
        </div>

        {/* Problem grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10">
          {problems.map((prob, i) => (
            <div 
              key={i} 
              className="group bg-[#FFFBF7] border border-[#F4E6ED] rounded-[28px] p-6 xl:p-7 shadow-sm hover:shadow-xl hover:border-pink-200/80 transition-all duration-300 flex flex-col justify-between h-full"
            >
              {/* Image Container - Perfect Aspect Ratio & Alignment */}
              <div className="w-full aspect-[16/10] bg-gradient-to-b from-[#FFF5EC] to-[#FFF8F3] border border-[#F5E8DE] rounded-2xl mb-6 p-4 flex items-center justify-center overflow-hidden relative group-hover:bg-[#FFF2E8] transition-colors duration-300">
                <img 
                  src={prob.image} 
                  alt={prob.title} 
                  className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm" 
                />
              </div>

              {/* Content Area */}
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl xl:text-2xl font-bold text-[#1E0E34] mb-3 leading-snug">
                    {prob.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {prob.desc1}
                  </p>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed pt-3 border-t border-pink-100/80 font-medium text-slate-700">
                  {prob.desc2}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

