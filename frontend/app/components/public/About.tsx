"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Shield, 
  Truck, 
  Handshake, 
  Clock, 
  MapPin, 
  Award,
  Users,
  Building2,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Package,
  Zap,
  Sparkles
} from "lucide-react";

// Types
interface StatItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface ValuePillar {
  title: string;
  copy: string;
  icon: React.ReactNode;
}

interface TimelineItem {
  year: string;
  title: string;
  detail: string;
}

// Data
const heroStats: StatItem[] = [
  { label: "Active Suppliers", value: "240+", icon: <Users className="w-5 h-5" /> },
  { label: "Projects Supported", value: "1,800+", icon: <Building2 className="w-5 h-5" /> },
  { label: "Fulfilment Accuracy", value: "99.2%", icon: <CheckCircle className="w-5 h-5" /> },
];

const valuePillars: ValuePillar[] = [
  {
    title: "Transparent Procurement",
    copy: "We aggregate Angola's most trusted material partners in one digital marketplace so every Africa Kaiser order is priced fairly and tracked in real time.",
    icon: <Shield className="w-8 h-8" />,
  },
  {
    title: "Intelligent Fulfilment",
    copy: "Our logistics control tower orchestrates warehousing, routing, and last-mile delivery to keep megaprojects supplied without bottlenecks.",
    icon: <Truck className="w-8 h-8" />,
  },
  {
    title: "Partnership Mindset",
    copy: "From public infrastructure to boutique developments, we operate as an embedded partner that scales with each client's ambition.",
    icon: <Handshake className="w-8 h-8" />,
  },
];

const timeline: TimelineItem[] = [
  {
    year: "2016",
    title: "Roots in Angola",
    detail: "Africa Kaiser started as a boutique supplier serving Luanda's fast-growing skyline.",
  },
  {
    year: "2019",
    title: "Marketplace Launch",
    detail: "We digitised procurement and opened access to vetted suppliers across the country.",
  },
  {
    year: "2022",
    title: "Intelligent Logistics",
    detail: "Our control tower introduced predictive routing, improving reliability for mega-projects.",
  },
  {
    year: "2024",
    title: "Continental Outlook",
    detail: "We are scaling Africa Kaiser into a pan-African platform with regional fulfilment hubs.",
  },
];

const teamMembers = [
  { name: "João Silva", role: "CEO & Founder", image: "/team/ceo.jpg" },
  { name: "Maria Santos", role: "Head of Operations", image: "/team/operations.jpg" },
  { name: "Carlos Mendes", role: "Logistics Director", image: "/team/logistics.jpg" },
];

const certifications = [
  { name: "ISO 9001", description: "Quality Management" },
  { name: "ISO 14001", description: "Environmental Management" },
  { name: "OHSAS 18001", description: "Health & Safety" },
];

const AboutPage: React.FC = () => {
  return (
    <>
    

      <div className="min-h-screen bg-gradient-to-b from-[#fef9f4] via-[#f8f3ee] to-[#f4f2ed] font-['Plus_Jakarta_Sans']">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.2rem] uppercase text-[#c9956b] bg-white/80 px-5 py-2.5 rounded-full backdrop-blur-sm border border-[#e8d5c4] shadow-sm">
                  <Sparkles className="w-4 h-4" />
                  About Africa Kaiser
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2c1810] mt-6 leading-tight">
                  Engineering confidence
                  <span className="block text-[#8B5A3C]">into every delivery</span>
                </h1>
              </div>
              
              <p className="text-lg text-[#5a3e32] leading-relaxed max-w-2xl font-['DM_Sans']">
                Africa Kaiser is a forward-looking marketplace and logistics partner built for Angola's most
                ambitious builders. We synchronise material sourcing, quality control, and delivery so our
                clients can concentrate on shaping skylines, ports, and resilient neighbourhoods.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {heroStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="group bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-[#e8d5c4] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-2 text-[#8B5A3C] mb-1">
                      {stat.icon}
                      <span className="text-3xl font-bold text-[#2c1810] group-hover:text-[#8B5A3C] transition-colors">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b4c3a] font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#8B5A3C]/90 to-[#5a3e32]/70">
                  <Image
                    src="/banner1.jpg"
                    alt="Africa Kaiser Operations"
                    fill
                    className="object-cover mix-blend-overlay"
                    priority
                  />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl px-6 py-4 shadow-lg border border-[#e8d5c4] animate-slide-in-right">
                  <p className="text-sm font-medium text-[#6b4c3a]">Trusted logistics ally</p>
                  <p className="text-2xl font-bold text-[#2c1810]">Since 2016</p>
                </div>

                {/* Bottom Badge */}
                <div className="absolute bottom-6 left-6 bg-[#2c1810]/90 backdrop-blur-sm rounded-xl px-6 py-3 text-white">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 fill-[#c9956b] text-[#c9956b] animate-pulse-slow" />
                    <span className="font-semibold">4.9/5 Customer Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-6 animate-fade-in">
              <div>
                <p className="text-sm font-semibold tracking-[0.2rem] uppercase text-[#c9956b] mb-3">
                  Our Story
                </p>
                <h2 className="text-4xl font-bold text-[#2c1810]">The Africa Kaiser story</h2>
              </div>
              
              <div className="space-y-4 text-[#5a3e32] leading-relaxed font-['DM_Sans']">
                <p>
                  We began inside construction sites, understanding the frustration engineers felt when
                  materials arrived late or incomplete. That insight became Africa Kaiser's obsession: create
                  a single digital command centre where procurement, logistics, and supplier accountability
                  intersect.
                </p>
                <p>
                  Today our network spans national highways and remote mining corridors, ensuring
                  consistent supply even during challenging seasons. Every workflow we design is rooted in transparency.
                  Clients receive milestone-based updates, compliance-ready documentation, and proactive alerts
                  long before a project faces risk.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-[#8B5A3C]/10 flex items-center justify-center group-hover:bg-[#8B5A3C]/20 transition-colors">
                    <MapPin className="w-6 h-6 text-[#8B5A3C]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b4c3a]">Regional Hubs</p>
                    <p className="text-lg font-bold text-[#2c1810]">5</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-[#8B5A3C]/10 flex items-center justify-center group-hover:bg-[#8B5A3C]/20 transition-colors">
                    <Clock className="w-6 h-6 text-[#8B5A3C]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b4c3a]">Avg. Delivery</p>
                    <p className="text-lg font-bold text-[#2c1810]">48 hrs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full bg-[#8B5A3C]/10 flex items-center justify-center group-hover:bg-[#8B5A3C]/20 transition-colors">
                    <Award className="w-6 h-6 text-[#8B5A3C]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b4c3a]">Satisfaction</p>
                    <p className="text-lg font-bold text-[#2c1810]">4.9/5</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 animate-slide-in-right">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-[#e8d5c4]">
                <h3 className="text-xl font-bold text-[#2c1810] mb-6">Why Choose Us</h3>
                <div className="space-y-4">
                  {[
                    { icon: <Shield className="w-5 h-5" />, text: "100% Quality Guaranteed" },
                    { icon: <Truck className="w-5 h-5" />, text: "Fast & Reliable Delivery" },
                    { icon: <Users className="w-5 h-5" />, text: "Expert Support Team" },
                    { icon: <Globe className="w-5 h-5" />, text: "Pan-African Network" },
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-[#f8f3ee] rounded-xl hover:bg-[#f0e6de] transition-colors group"
                    >
                      <div className="text-[#8B5A3C] group-hover:scale-110 transition-transform">{item.icon}</div>
                      <span className="font-medium text-[#2c1810]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Pillars Section */}
        <section className="bg-white/60 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
              <p className="text-sm font-semibold tracking-[0.2rem] uppercase text-[#c9956b] mb-3">
                What Drives Us
              </p>
              <h2 className="text-4xl font-bold text-[#2c1810]">
                Operating principles that power Africa Kaiser
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {valuePillars.map((pillar, index) => (
                <div
                  key={pillar.title}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e8d5c4] hover:-translate-y-2 animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#8B5A3C]/10 flex items-center justify-center text-[#8B5A3C] mb-6 group-hover:scale-110 transition-transform group-hover:bg-[#8B5A3C]/20">
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#2c1810] mb-3">{pillar.title}</h3>
                  <p className="text-[#5a3e32] leading-relaxed font-['DM_Sans']">{pillar.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
              <p className="text-sm font-semibold tracking-[0.2rem] uppercase text-[#c9956b] mb-3">
                Milestones
              </p>
              <h2 className="text-4xl font-bold text-[#2c1810]">
                From local disruptor to continental platform
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-[#e8d5c4] group hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Timeline Connector */}
                  {index < timeline.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[#c9956b]/30">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#c9956b]"></div>
                    </div>
                  )}
                  
                  <div className="text-sm font-semibold text-[#c9956b] tracking-wider mb-2">
                    {item.year}
                  </div>
                  <h4 className="text-lg font-bold text-[#2c1810] mb-2">{item.title}</h4>
                  <p className="text-[#5a3e32] text-sm leading-relaxed font-['DM_Sans']">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white/60 backdrop-blur-sm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
              <p className="text-sm font-semibold tracking-[0.2rem] uppercase text-[#c9956b] mb-3">
                Leadership
              </p>
              <h2 className="text-4xl font-bold text-[#2c1810]">Meet our team</h2>
              <p className="text-[#5a3e32] mt-4 font-['DM_Sans']">
                Dedicated professionals committed to excellence in every delivery
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e8d5c4] hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#8B5A3C]/20 to-[#c9956b]/10 relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-[#2c1810]">{member.name}</h4>
                    <p className="text-[#c9956b] font-medium">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-[#8B5A3C] to-[#6b4c3a] rounded-3xl p-12 shadow-2xl animate-fade-in">
              <div className="grid md:grid-cols-3 gap-8 text-white">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Certifications & Standards</h3>
                  <p className="text-white/80 font-['DM_Sans']">Committed to quality and excellence in everything we do</p>
                </div>
                {certifications.map((cert) => (
                  <div 
                    key={cert.name} 
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Award className="w-8 h-8 text-[#c9956b] flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-lg">{cert.name}</h4>
                        <p className="text-white/70 text-sm font-['DM_Sans']">{cert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
            <h2 className="text-4xl font-bold text-[#2c1810] mb-4">
              Ready to partner with us?
            </h2>
            <p className="text-[#5a3e32] text-lg mb-8 max-w-2xl mx-auto font-['DM_Sans']">
              Join hundreds of satisfied clients who trust Africa Kaiser for their material procurement needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#8B5A3C] text-white rounded-xl font-semibold hover:bg-[#6b4c3a] transition-colors shadow-lg hover:shadow-xl group"
              >
                Get in Touch
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2c1810] rounded-xl font-semibold border-2 border-[#8B5A3C] hover:bg-[#f8f3ee] transition-colors group"
              >
                Browse Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;