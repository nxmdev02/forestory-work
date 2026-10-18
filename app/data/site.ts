import reference from "./reference.json";

export const site = {
  name: "forestory furniture",
  description: "나무에 이야기를 담다. 프리미엄 우드 스튜디오 포레스토리 목공방",
  shareImage: {
    url: "https://www.forestory.work/images/forestory-landscape-logo-v1.jpg",
    alt: "푸른 숲과 하늘을 배경으로 펼친 흰색 소나무와 forestory 로고",
    width: 1200,
    height: 630,
  },
  email: "bos6079@naver.com",
  phone: "010 7752 6079",
  phoneHref: "+821077526079",
  address: ["전남광주 광산구 송정공원로 75번길 86", "1층 포레스토리 목공방"],
  navigation: [
    { label: "projects", href: "/projects" },
    { label: "forestory archive", href: "/archive" },
    { label: "office", href: "/office" },
  ],
  socials: [
    { label: "Instagram", href: "https://www.instagram.com/forestory_furniture/" },
    { label: "Kakao", href: "https://open.kakao.com/o/s4OgTYOd" },
  ],
  copyright: "© 2026, forestory furniture",
  credit: "Differs",
  projectHero: {
    image: "/images/wood-interior-cta.webp",
    alt: "원목 선반과 테이블이 놓인 따뜻한 실내 공간",
    objectPosition: "center bottom",
  },
};
export const projects = reference.projects;
export const projectDetails = reference.projectDetails;
export type Project = (typeof projects)[number];
export const projectCategories = [
  { id: "media-pop-up", label: "MEDIA & POP-UP", description: "미디어 세트 & 브랜드 팝업" },
  { id: "commercial-space", label: "COMMERCIAL SPACE", description: "상업 & 공간 맞춤 가구" },
  { id: "heritage-craft", label: "HERITAGE CRAFT", description: "자개 리폼" },
  { id: "premium-woodwork", label: "PREMIUM WOODWORK", description: "우드슬랩 테이블" },
] as const;
export const archiveItems = reference.archiveItems;
export const office = reference.office;
export const services = [
  {
    title: "프리미엄 맞춤 원목가구",
    headline: "단 하나의 공간을 위한 디테일",
    description:
      "주거공간(주택, 아파트)부터 상업공간(카페, 스튜디오 등)까지, 공간의 구조와 사용자의 라이프스타일에 맞춰 최상급 목재로 프리미엄 원목 가구 및 오브제들을 제작합니다.",
  },
  {
    title: "상업가구 & 정밀시공 기획",
    headline: "상업 공간의 브랜딩을 완벽하게 구현하는 기술력",
    description:
      "팝업스토어, 플리마켓 등 행사에 필요한 이동식 가판대, 계산대 등 상업가구와 브랜드의 나무 현판, 스탠드 간판 등 CNC 정밀가공을 통하여 부품 대량생산 및 유연한 납기 대응이 가능합니다.",
  },
  {
    title: "자개 업사이클링, 리폼",
    headline: "세월의 가치에 현대적 감각을 더하는 자개 솔루션",
    description:
      "고객님이 소유한 오래된 자개장 및 자개 가구를 현대적 감성의 소품이나 액자, 가구로 재탄생시킵니다. 자개의 아름다움을 돋보이게 하는 코팅 기술력과 고객님이 원하는 용도, 사이즈, 컬러 등 니즈에 맞추어 제작합니다.",
  },
];
export const scenes = [
  {
    id: "intro",
    kind: "intro",
    title: ["designing furniture", "connecting people"],
    imageSrc: "/images/intro-poster.jpg",
    video: reference.intro.video,
    videoStart: 8,
    objectPosition: "center",
    mobileObjectPosition: "center",
    overlayOpacity: 0.02,
  },
  ...[
    { id: "fellowmind-goteborg", imageSrc: "/images/fellowmind-goteborg-hero.webp", title: ["crafting wood", "telling stories"] },
    { id: "tarsier", imageSrc: "/images/tarsier-hero.webp", title: ["shaped by nature", "crafted with care"] },
    { id: "fellowmind-malmo", imageSrc: "/images/fellowmind-malmo-hero.webp", title: ["thoughtful details", "everyday living"] },
  ].map(({ id, imageSrc, title }) => {
    return {
      id,
      kind: "project",
      title,
      imageSrc,
      video: "",
      videoStart: 0,
      objectPosition: "center",
      mobileObjectPosition: "center",
      overlayOpacity: 0.04,
    };
  }),
];
