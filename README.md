# Store Empire — prototyp 0.1

Store Empire je webová manažerská simulace malého obchodu. Hra obsahuje cenotvorbu, sklad, dodavatele, objednávky s doručením v následujícím herním dni, simulaci zákazníků, denní tržby a náklady a investice do rozvoje obchodu.

## Spuštění

Protože projekt používá JavaScriptové ES moduly, otevři ho přes lokální webový server (ne dvojklikem na `index.html`).

### Možnost A: VS Code
1. Rozbal ZIP do složky.
2. Otevři složku ve VS Code.
3. Nainstaluj rozšíření **Live Server**.
4. Pravým tlačítkem na `index.html` → **Open with Live Server**.

### Možnost B: Python
V terminálu přejdi do složky projektu a spusť:

```bash
python -m http.server 8000
```

Pak otevři `http://localhost:8000`.

## Ovládání
- **Přehled:** stav obchodu, tržby, náklady, zákazníci a nízké zásoby.
- **Produkty a ceny:** změna prodejních cen a úprava zásob pro testování.
- **Dodavatelé:** přehled obchodních partnerů.
- **Objednávky:** vyber dodavatele, produkt a počet kusů; cena se odečte ihned a dodávka dorazí další herní den.
- **Ukončit den:** simuluje prodeje, poptávku, provozní náklady a ztráty potravin.
- **Rozvoj obchodu:** kupuj další regály, marketing a chladicí vybavení.
- **Uložit hru:** ukládá stav do localStorage aktuálního prohlížeče.

## Publikování na GitHub Pages
1. Vytvoř GitHub repository `store-empire`.
2. Nahraj všechny soubory a složky včetně `index.html`, `style.css`, `js/` a `assets/`.
3. V repository otevři **Settings → Pages**.
4. Jako zdroj vyber **Deploy from a branch**, větev `main` a složku `/ (root)`.
5. Ulož nastavení a počkej na zveřejnění webu.

Three.js se načítá z veřejného CDN jsDelivr, takže 3D náhled vyžaduje internetové připojení. Když CDN není dostupné, zůstává viditelný CSS náhled prodejny. Herní postup se ukládá lokálně do prohlížeče; nefunguje automatická synchronizace mezi zařízeními.

## Poznámky k prototypu
- Jde o hratelný první prototyp, ne o hotovou komerční hru.
- 3D scéna je základní procedurální scéna z geometrických objektů, nikoli detailní modelová prodejna.
- Ceny, poptávka a dodávky jsou herní simulace, nikoli reálná data.
- V další verzi lze doplnit pohyb hráče po 3D prostoru, skutečné modely regálů a produktů, zaměstnance, více typů smluv s dodavateli, ukládání do cloudu a ekonomickou obtížnost.
