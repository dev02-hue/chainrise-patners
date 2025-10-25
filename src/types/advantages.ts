 
  


export interface AdvantageItem {
  id: string;
  title: string;
  description: string;
  media: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
  cta?: {
    text: string;
    href: string;
  };
}

export interface AdvantagesSectionProps {
  advantages: AdvantageItem[];
  className?: string;
}