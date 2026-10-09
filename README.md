# infoskate — Chorão Eterno

Site-homenagem de fã a Chorão e ao Charlie Brown Jr.: a origem do apelido no skate,
uma jukebox com os maiores sucessos (tocados pelo player oficial do Spotify),
a discografia, a linha do tempo, curiosidades com fonte e a formação da banda.

Site estático (HTML, CSS e JavaScript puros, sem build).

## Estrutura

```
index.html              Landing page
assets/css/style.css    Design system e estilos
assets/js/script.js     Menu mobile, jukebox (busca, filtros, sorteio, player do Spotify),
                        prateleira de discos, curiosidades e animações de rolagem
assets/img/             Imagens otimizadas (WebP + JPG de fallback)
```

## Música

Nenhum arquivo de áudio é hospedado no site. As faixas tocam pelo embed oficial do
Spotify (carregado só quando o visitante escolhe uma música) e há links para Spotify,
YouTube Music e YouTube. Sem login no Spotify, o embed toca apenas uma prévia.

## Rodando localmente

```
npx http-server -p 8080
```
