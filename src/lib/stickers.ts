// Stickers from Flaticon CDN (free, attribution: flaticon.com)
// URL: https://cdn-icons-png.flaticon.com/256/{folder}/{id}.png

export interface StickerItem {
  id: string;
  url: string;
  label: string;
}

export interface StickerGroup {
  label: string;
  icon: string;
  items: StickerItem[];
}

const f = (folder: number, id: number, label: string): StickerItem => ({
  id: `${folder}-${id}`,
  url: `https://cdn-icons-png.flaticon.com/256/${folder}/${id}.png`,
  label,
});

export const STICKER_GROUPS: StickerGroup[] = [
  {
    label: "Criatividade",
    icon: "💡",
    items: [
      f(8359, 8359790, "lâmpada"),
      f(4681, 4681580, "estudando"),
      f(7590, 7590135, "ideias"),
      f(4651, 4651962, "criatividade"),
      f(4359, 4359757, "criatividade"),
      f(4651, 4651969, "criatividade"),
      f(6723, 6723891, "foguete"),
      f(8005, 8005269, "criativo"),
      f(6299, 6299781, "solução"),
      f(4359, 4359712, "seja criativo"),
      f(5700, 5700451, "arte"),
      f(5175, 5175215, "foguete"),
      f(6684, 6684491, "ideia"),
      f(4392, 4392514, "criatividade"),
      f(4392, 4392479, "criatividade"),
    ],
  },
  {
    label: "Escola",
    icon: "📚",
    items: [
      f(4681, 4681574, "lendo"),
      f(4681, 4681582, "escrevendo"),
      f(4681, 4681576, "calculando"),
      f(4681, 4681578, "pesquisando"),
      f(8359, 8359794, "livros"),
      f(8359, 8359792, "lápis"),
      f(4359, 4359710, "caderno"),
      f(4359, 4359714, "mochila"),
      f(4392, 4392484, "certificado"),
      f(4392, 4392490, "graduação"),
    ],
  },
  {
    label: "Trabalho",
    icon: "🚀",
    items: [
      f(6723, 6723893, "lançamento"),
      f(6299, 6299783, "meta"),
      f(6299, 6299785, "gráfico"),
      f(6299, 6299787, "trabalho"),
      f(8005, 8005271, "time"),
      f(8005, 8005273, "apresentação"),
      f(4359, 4359716, "computador"),
      f(4359, 4359718, "reunião"),
      f(4392, 4392494, "relatório"),
      f(4651, 4651964, "estratégia"),
    ],
  },
  {
    label: "Cute",
    icon: "🌸",
    items: [
      f(4651, 4651966, "bonito"),
      f(4651, 4651970, "fofo"),
      f(4651, 4651972, "kawaii"),
      f(4651, 4651974, "cute"),
      f(4359, 4359720, "coração"),
      f(4359, 4359722, "estrela"),
      f(6684, 6684493, "arco-íris"),
      f(6684, 6684495, "nuvem"),
      f(5700, 5700453, "flor"),
      f(5700, 5700455, "borboleta"),
    ],
  },
];