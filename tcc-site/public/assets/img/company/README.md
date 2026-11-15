# Company logo drop folder

Place permissioned logo files here, named exactly by the company id listed below.
`.png` is the format the tile builder reads (a 512×512 white plate works best);
`.svg` / `.webp` / `.jpg` files are kept for reference but are not compiled.

Example: `tcs.png`

Nothing in this folder is displayed until it is activated with:

```bash
cd tcc-site
node scripts/sync-company-logos.js --approve tcs,google,amazon
node scripts/build-company-logo-tiles.js   # normalise -> clean/<id>.png
node scripts/build-prep-pages.js           # rebuild roster + company pages
```

Anything not activated keeps its existing wordmark tile, so partial coverage is fine.

Check what the script can see at any time:

```bash
node scripts/sync-company-logos.js --list
```

---

## How the tiles are rendered

`clean/` is the only folder the site serves. `scripts/build-company-logo-tiles.js`
turns each source plate into an **opaque white 256×256 square**: it trims the
artwork to its bounding box, then centres it at 90% of the canvas. Because the
plate is baked in, brand colours stay exact and no CSS filter is needed.

The roster and homepage styles therefore use `object-fit: contain` on a white
tile. **Do not** add `filter: brightness(0) invert(1)` or `object-fit: cover` —
that was what turned filled marks into white blobs. Re-run the builder after
replacing any source file.

---

## Filenames (71)

### IT Services
| Company | Filename |
| --- | --- |
| TCS | `tcs` |
| Infosys | `infosys` |
| Wipro | `wipro` |
| IBM | `ibm` |
| HCLTech | `hcl` |
| Tech Mahindra | `techmahindra` |
| LTIMindtree | `ltimindtree` |
| Mphasis | `mphasis` |
| Persistent Systems | `persistent` |
| Coforge | `coforge` |
| Capgemini | `capgemini` |
| Cognizant | `cognizant` |
| Genpact | `genpact` |
| Virtusa | `virtusa` |
| Zensar | `zensar` |
| Birlasoft | `birlasoft` |

### Product & GCC
| Company | Filename |
| --- | --- |
| Google | `google` |
| Microsoft | `microsoft` |
| Amazon | `amazon` |
| Meta | `meta` |
| Apple | `apple` |
| Adobe | `adobe` |
| Nvidia | `nvidia` |
| Intel | `intel` |
| Qualcomm | `qualcomm` |
| Salesforce | `salesforce` |
| Oracle | `oracle` |
| SAP | `sap` |
| ServiceNow | `servicenow` |
| Atlassian | `atlassian` |
| Uber | `uber` |
| Stripe | `stripe` |
| PayPal | `paypal` |
| Cisco | `cisco` |
| VMware | `vmware` |
| Dell | `dell` |
| HP | `hp` |
| Samsung | `samsung` |
| Bosch | `bosch` |
| Siemens | `siemens` |

### Indian Product
| Company | Filename |
| --- | --- |
| Zoho | `zoho` |
| Freshworks | `freshworks` |
| Flipkart | `flipkart` |
| Swiggy | `swiggy` |
| Zomato | `zomato` |
| Razorpay | `razorpay` |
| PhonePe | `phonepe` |
| Paytm | `paytm` |
| Meesho | `meesho` |
| CRED | `cred` |
| Dream11 | `dream11` |
| Zerodha | `zerodha` |
| Groww | `groww` |
| Ola | `ola` |
| Nykaa | `nykaa` |
| Myntra | `myntra` |
| InMobi | `inmobi` |
| Postman | `postman` |
| BrowserStack | `browserstack` |
| Chargebee | `chargebee` |

### Consulting
| Company | Filename |
| --- | --- |
| Deloitte | `deloitte` |
| EY | `ey` |
| PwC | `pwc` |
| KPMG | `kpmg` |
| Accenture | `accenture` |

### Finance Tech
| Company | Filename |
| --- | --- |
| Goldman Sachs | `goldmansachs` |
| JPMorgan Chase | `jpmorgan` |
| Morgan Stanley | `morganstanley` |
| Barclays | `barclays` |
| Deutsche Bank | `deutschebank` |
| Wells Fargo | `wellsfargo` |
