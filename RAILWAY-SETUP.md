# Website deployen op Railway — stap voor stap

Deze handleiding brengt je webshop online op Railway met eigen domein.
Geschatte kostprijs: ±$5–10/maand (Railway Hobby plan).

## Stap 1 — Code op GitHub zetten

1. Maak een account op https://github.com (gratis)
2. Maak een **nieuwe private repository** (bv. `custompscontrollers`)
3. Vraag Kimi om de code te pushen, of doe het zelf in een terminal in de projectmap:
   ```bash
   git init
   git add .
   git commit -m "Webshop"
   git remote add origin https://github.com/JOUWNAAM/custompscontrollers.git
   git push -u origin main
   ```

## Stap 2 — Railway-project aanmaken

1. Ga naar https://railway.app en log in met je GitHub-account
2. Klik **New Project** → **Deploy from GitHub repo** → kies je repository
3. Railway detecteert automatisch de `Dockerfile` en `railway.json`

## Stap 3 — MySQL-database toevoegen

1. In je Railway-project: **New** → **Database** → **MySQL**
2. Railway maakt automatisch een database aan

## Stap 4 — Environment variabelen instellen

Ga naar je webshop-service → **Variables** en voeg toe:

| Variabele | Waarde |
|---|---|
| `APP_ID` | (waarde uit je lokale `.env`) |
| `APP_SECRET` | (waarde uit je lokale `.env`) |
| `DATABASE_URL` | Kopieer de `MYSQL_URL` van de database-service |
| `RESEND_API_KEY` | Je Resend API key (`re_...`) |
| `NODE_ENV` | `production` |

## Stap 5 — Database-tabellen aanmaken

Open een shell op de webshop-service (Railway → service → **Shell**) en voer uit:
```bash
npm run db:push
```

## Stap 6 — Domein koppelen

1. Railway → je service → **Settings** → **Networking** → **Custom Domain**
2. Voer je domein in (bv. `www.custompscontrollers.com`)
3. Bij je domeinprovider (Combell/Namecheap/…) maak je een **CNAME-record** aan dat naar de Railway-url wijst
4. HTTPS wordt automatisch geregeld

## Stap 7 — Google Search Console

1. https://search.google.com/search-console → property toevoegen
2. Kies "URL-prefix", bevestig eigendom via DNS-record of meta-tag
3. Dien `https://jouwdomein/sitemap.xml` in als sitemap

---

Klaar! Je site draait dan 24/7 op je eigen domein.
