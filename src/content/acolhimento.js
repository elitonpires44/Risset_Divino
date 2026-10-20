import { site } from './site.js';

export const topics = {
  proposito: { title: 'Qual é o propósito do projeto?', text: `${site.foundations.text} ${site.band.text}`, href: '/#proposito', label: 'Conhecer o propósito' },
  livro: { title: 'Conheça O Portal Eterno', text: `${site.book.title}. ${site.book.text} ${site.book.meta.map(([k,v]) => `${k}: ${v}`).join('. ')}.`, href: '/#obra', label: 'Conhecer a obra' },
  mapas: { title: 'O que os mapas apresentam?', text: site.visuals.map(v => `${v.title} ${v.text}`).join('\n\n'), href: '/#plano', label: 'Contemplar os mapas' },
  movimento: { title: 'Como o movimento atua?', text: `${site.movement.text} ${site.movement.items.map(([k,v]) => `${k}: ${v}`).join('\n')}`, href: '/#movimento', label: 'Conhecer as frentes' },
  participar: { title: 'Como posso participar?', text: `${site.cta.text} Para registrar seu interesse, acesse a página Participar e preencha a ficha de inscrição.`, href: '/participar', label: 'Quero participar' },
};
