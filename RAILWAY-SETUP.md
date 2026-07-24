# Website deployen op Railway — stap voor stap

Domein: **custompscontrollers.com** · Hosting: Railway (±$5/maand Hobby plan)
Alles is al voorbereid: `Dockerfile`, `railway.json` en de git-repository staan klaar.

## Stap 1 — Code op GitHub zetten

1. Maak een account op https://github.com (gratis)
2. Maak een **nieuwe private repository** (bv. `custompscontrollers`), zonder README
3. Vraag Kimi om te pushen, of zelf in de terminal in de projectmap:
   ```bash
   git remote add origin https://github.com/JOUWNAAM/custompscontrollers.git
   git branch -M main
   git push -u origin main
   ```

## Stap 2 — Railway-project aanmaken

1. Ga naar https://railway.app → log in met je GitHub-account
2. **New Project** → **Deploy from GitHub repo** → kies `custompscontrollers`
3. Railway detecteert automatisch de `Dockerfile` — de build start

## Stap 3 — MySQL-database toevoegen

1. In het Railway-project: **+ New** → **Database** → **Add MySQL**
2. Klik op de MySQL-service → tabblad **Variables** → kopieer de waarde van `MYSQL_URL`

## Stap 4 — Environment variabelen instellen

Klik op de **webshop-service** (niet de database) → **Variables** → voeg toe:

| Variabele | Waarde |
|---|---|
| `APP_ID` | `custompscontrollers` (mag eender wat zijn) |
| `APP_SECRET` | een willekeurige lange string (bv. 32 tekens) |
| `DATABASE_URL` | de `MYSQL_URL` uit stap 3 |
| `RESEND_API_KEY` | `re_44W9GJhD_AzhUmoeenuQMgFCxT3L4MfpD` |
| `NODE_ENV` | `production` |

## Stap 5 — Database-tabellen aanmaken

1. Klik op de webshop-service → **Settings** → zoek **Shell** (of via Railway CLI)
2. Voer uit:
   ```bash
   npm run db:push
   ```

## Stap 6 — Domein koppelen (custompscontrollers.com)

1. Webshop-service → **Settings** → **Networking** → **Custom Domain**
2. Vul in: `www.custompscontrollers.com`
3. Railway toont een CNAME-doel (bv. `xyz.up.railway.app`)
4. Bij **Namecheap** (Advanced DNS):
   - Pas het bestaande CNAME-record aan: Host `www` → het Railway-doel
   - De URL Redirect `@` → `https://www.custompscontrollers.com` mag blijven
5. Railway maakt automatisch een gratis SSL-certificaat aan

## Stap 7 — .be forward controleren

De Combell-forward `custompscontrollers.be` → `https://www.custompscontrollers.com`
blijft gewoon werken — die wijst al naar het juiste adres.

## Stap 8 — Google Search Console

1. https://search.google.com/search-console → **Property toevoegen** → URL-prefix: `https://www.custompscontrollers.com`
2. Verifieer via DNS-record (TXT) dat je bij Namecheap toevoegt onder Advanced DNS
3. Dien in als sitemap: `https://www.custompscontrollers.com/sitemap.xml`

---

## Testlijst na deploy

- [ ] Site laadt op `https://www.custompscontrollers.com`
- [ ] Testbestelling plaatsen → verschijnt in `/admin` (wachtwoord: Dpm5046656)
- [ ] Mail komt aan op custom.pscontrollers@hotmail.com
- [ ] `.be`-domein forwardt naar `.com`

## Let op

- De database bij Railway is **nieuw en leeg** — bestellingen uit de Kimi-testfase komen niet mee
- Verander nooit de `DATABASE_URL` zonder reden; daar staan je bestellingen in
