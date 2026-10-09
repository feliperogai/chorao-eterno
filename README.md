# infoskate — Chorão Eterno

Site-homenagem de fã a Chorão e ao Charlie Brown Jr.: a origem do apelido no skate,
uma faixa para ouvir no próprio site, setlist com links do YouTube e a formação da banda.

Site estático (HTML, CSS e JavaScript puros, sem build).

## Estrutura

```
index.html                 Landing page
assets/pages/CBJR.html     Página de orçamento
assets/css/style.css       Design system e estilos da home
assets/css/CBJR.css        Estilos da página de orçamento
assets/js/script.js        Menu mobile, player de áudio, animações de rolagem
assets/img/                Imagens otimizadas (WebP + JPG de fallback)
assets/audio/              Faixa "Proibida pra Mim"
```

## Rodando localmente

Qualquer servidor estático funciona, por exemplo:

```
npx http-server -p 8080
```
