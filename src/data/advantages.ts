import { AdvantageItem } from '@/types/advantages';

export const advantagess: AdvantageItem[] = [
  {
    id: 'expert-management',
    title: "Expert Management Team",
    description: "Our platform is managed by a team of seasoned professionals with extensive experience in their respective fields. From real estate moguls and agricultural experts to crypto pioneers and stock market analysts, our team's deep industry knowledge and strategic insight drive superior investment performance.",
    media: {
      type: 'image',
      src: "/traxer-kM6QNrgo0YE-unsplash.jpg",
      alt: "Professional management team discussing strategy"
    },
    cta: {
      text: "Meet Our Team",
      href: "/team"
    }
  },
  {
    id: 'diversified-portfolio',
    title: "Diversified Investment Portfolio",
    description: "ChainRise-Patners offers a unique advantage through its diversified investment portfolio that spans across real estate, agriculture, crypto mining, and stock trading. This multi-sector approach reduces risk while providing multiple streams of potential returns.",
    media: {
      type: 'video',
      src: "https://www.youtube.com/embed/LGHsNaIv5os",
      alt: "Diversified investment portfolio visualization"
    }
  },
  {
    id: 'transparent-approach',
    title: "Transparent & Client-Focused",
    description: "We prioritize transparency and client satisfaction in all our operations. With regular updates, responsive support, and a commitment to ethical practices, clients are always informed and confident in their investment journey.",
    media: {
      type: 'image',
      src: "/hamidu-samuel-mansaray-ynBZCC173iU-unsplash.jpg",
      alt: "Client consultation and transparent communication"
    },
    cta: {
      text: "Learn About Our Process",
      href: "/process"
    }
  },
  {
    id: 'innovative-technology',
    title: "Innovative Technology & Data-Driven Insights",
    description: "At ChainRise-Patners, we leverage the latest technology and data analytics to optimize investment strategies. Our tools enable real-time market trend analysis and informed decisions that deliver strong returns.",
    media: {
      type: 'image',
      src: "/windows-6G6akT8biLg-unsplash.jpg",
      alt: "Advanced technology and data analytics dashboard"
    }
  }
];