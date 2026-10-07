# Contexto do repositório — dashboard-ecommerce

## Objetivo
- Manter o dashboard de e-commerce em React 18, Vite 5, Recharts e Tailwind 3, baseado nos CSVs de `dataset/`.
- Leia também `CLAUDE.md` antes de alterar dados, métricas ou interface; este resumo não substitui suas regras e definições.

## Arquitetura
- `scripts/build-data.mjs` transforma CSVs em JSONs agregados em `public/data/`; o navegador carrega os JSONs via `src/hooks/useData.js`, sem analisar CSV bruto.
- `src/App.jsx` mantém os filtros globais de ano, categoria e país; `src/views/` separa Overview, RevenueSales, CustomersRetention, ProductsOps e MarketingAcquisition.
- `src/components/` contém componentes compartilhados; `src/lib/format.js` e `colors.js` concentram formato e paleta.
- `design-system/index.html` é referência visual estática de outro domínio, não especificação funcional do dashboard; `design-variations/` contém estudos de estilo.

## Contratos e grão
- `customers.csv`: uma linha por cliente, chave `customer_id`; `orders.csv`: uma linha por item de pedido, com `order_id` e `customer_id`. Não presuma que `order_id` seja único por linha.
- `monthly_revenue.csv`: resumo por ano/mês; `product_summary.csv`: resumo por produto/categoria. Preserve o grão antes de somar, filtrar ou comparar.
- Receita de pedidos usa `orders.total_amount_usd`; `customers.total_spend_usd` é gasto acumulado/LTV, não a mesma métrica. Não misture as duas sob um rótulo único.
- Mudanças em nomes ou estrutura de `public/data/*.json` exigem ajuste coordenado do gerador e dos consumidores em `src/`.

## Áreas protegidas
- Não sobrescreva os quatro CSVs de `dataset/` nem trate os assets com hash de `design-system/` como código-fonte da aplicação.
- Não inclua amostras de clientes, dados sensíveis, segredos ou artefatos gerados no contexto ou em logs desnecessários.

## Comandos e verificação
- Scripts confirmados em `package.json` (não executados nesta inspeção): `npm run build:data`, `npm run dev`, `npm run build`, `npm run preview`.
- `dev` e `build` executam `build:data` automaticamente via `predev`/`prebuild`; não há script de teste ou lint configurado.
- Após mudanças, confira coerência entre gerador e visualizações, filtros e rótulos das métricas; rode os scripts pertinentes apenas em ambiente preparado e registre o resultado real.
