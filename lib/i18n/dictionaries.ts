export type Locale = "en" | "zh";

export const LOCALE_COOKIE_NAME = "amity_locale";

export type Dictionary = {
  nav: {
    home: string;
    about: string;
    services: string;
    resources: string;
    blog: string;
    contact: string;
    tools: string;
  };
  footer: {
    newsletterHeading: string;
    newsletterBlurb: string;
    newsletterPlaceholder: string;
    newsletterSubmit: string;
    newsletterSuccess: string;
    portalLogin: string;
    registeredAgent: string;
  };
  common: {
    submit: string;
    loading: string;
    chatWhatsApp: string;
    bookConsultation: string;
    learnMore: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      resources: "Resources",
      blog: "Blog",
      contact: "Contact",
      tools: "Tools",
    },
    footer: {
      newsletterHeading: "Stay informed",
      newsletterBlurb:
        "Occasional updates on migration pathways and practice news. No spam.",
      newsletterPlaceholder: "Your email",
      newsletterSubmit: "Subscribe",
      newsletterSuccess: "Thanks — you are subscribed.",
      portalLogin: "Client portal",
      registeredAgent: "Registered migration agent services. Not a law firm.",
    },
    common: {
      submit: "Submit",
      loading: "Please wait…",
      chatWhatsApp: "Chat on WhatsApp",
      bookConsultation: "Book a consultation",
      learnMore: "Learn more",
    },
  },
  zh: {
    nav: {
      home: "首页",
      about: "关于我们",
      services: "服务",
      resources: "资源",
      blog: "博客",
      contact: "联系",
      tools: "工具",
    },
    footer: {
      newsletterHeading: "订阅资讯",
      newsletterBlurb: "不定期分享移民路径与事务所动态，绝无垃圾邮件。",
      newsletterPlaceholder: "您的邮箱",
      newsletterSubmit: "订阅",
      newsletterSuccess: "感谢订阅。",
      portalLogin: "客户门户",
      registeredAgent: "注册移民代理服务。非律师事务所。",
    },
    common: {
      submit: "提交",
      loading: "请稍候…",
      chatWhatsApp: "WhatsApp 咨询",
      bookConsultation: "预约咨询",
      learnMore: "了解更多",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
