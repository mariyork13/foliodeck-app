import type { Curator } from "./types";

// Sample data pulled from the live foliodeck.pro catalog (36 of 706 total
// entries) — enough to build and test the UI. Full migration of all 706
// records happens separately via a proper Tilda CSV export.
export const curators: Curator[] = [
  { slug: "denis-lykin", name: "Denis Lykin", role: "Product & UI UX Designer", externalUrl: "https://denislykin.ru/", previewImage: "https://static.tildacdn.com/stor3338-3933-4530-b135-313533333761/119cdfe277a4f6aef15bff9577b4df2d.png" },
  { slug: "casper-kessels", name: "Casper Kessels", role: "Product & UI UX Designer", externalUrl: "https://www.casperkessels.com/", previewImage: "https://static.tildacdn.com/stor3231-6432-4461-b365-323463643864/de0439364a21301c0227314b8ad28e0d.png" },
  { slug: "judy-zhou", name: "Judy Zhou", role: "Graphic Designer", externalUrl: "https://judyzhou.me/", previewImage: "https://static.tildacdn.com/stor6462-6637-4964-b465-663862323736/8e194f14aa9d590f594923227e94a8ec.png" },
  { slug: "emmi-wu", name: "Emmi Wu", role: "Product & UI UX Designer", externalUrl: "https://emmiwu.com/playground", previewImage: "https://static.tildacdn.com/stor3861-3761-4461-b264-613638306533/a7e21c69324f07482ae71ee031256ab9.png" },
  { slug: "manish-kumar", name: "Manish Kumar", role: "Developer", externalUrl: "https://www.manixh.dev/", previewImage: "https://static.tildacdn.com/stor3036-3835-4639-b636-383231313232/68ed6c453ce595b4471dd62055441a0b.jpg" },
  { slug: "lucie-bajgart", name: "Lucie Bajgart", role: "Brand Designer", externalUrl: "https://x.com/LucieBajgart", previewImage: "https://static.tildacdn.com/stor6236-3262-4561-b331-376366336138/46efd3fcdd48cd5c4dda957ba2a08231.png" },
  { slug: "maksim-melnikov", name: "Максим Мельников", role: "Product & UI UX Designer", externalUrl: "https://pxman.art/", previewImage: "https://static.tildacdn.com/stor3634-6363-4839-b430-323039643565/a7bf3bd74cab5ea9792c4babacc4f537.png" },
  { slug: "vuk", name: "Vuk", role: "Product & UI UX Designer", externalUrl: "https://vuk.fyi/", previewImage: "https://static.tildacdn.com/stor3661-3966-4861-b139-346235613537/bf416da0d828b6b8a54fbb1cefa8ad26.png" },
  { slug: "jesper-landberg", name: "Jesper Landberg", role: "Developer", externalUrl: "https://jesperlandberg.com/", previewImage: "https://static.tildacdn.com/stor3830-6430-4264-b430-623538633763/f8f2937a436b8a19502708ab0af2fa3a.png" },
  { slug: "dayan-daniello", name: "Dayan D'Aniello", role: "Graphic Designer", externalUrl: "https://day-and.co/", previewImage: "https://static.tildacdn.com/stor6463-3862-4330-b038-666237653539/e1e6f8db99f3663a0f2e21050a3f273f.png" },
  { slug: "artyom-nabokov", name: "Artyom Nabokov", role: "Product & UI UX Designer", externalUrl: "https://bankas1dra.github.io/portfolio/index.html", previewImage: "https://static.tildacdn.com/stor3662-3661-4538-b831-323334343631/ab7e44a74a5c3ef04ddc5d091bf61a2a.png" },
  { slug: "ilnur-galimov", name: "Илнур Галимов", role: "Product & UI UX Designer", externalUrl: "https://galimovilnur-portfolio.ru/", previewImage: "https://static.tildacdn.com/stor3632-6266-4632-a630-373666323030/831f2072c11a2b51f2e9a3fd6742080e.png" },
  { slug: "smith-and-diction", name: "Smith & Diction", role: "Branding Design Studio", externalUrl: "https://smith-diction.com/work", previewImage: "https://static.tildacdn.com/stor3535-3561-4134-b937-386236636161/a0c51bf39c07e2c94cce061943f530a6.png" },
  { slug: "katya-kozhevyatova", name: "Катя Кожевятова", role: "Product & UI UX Designer", externalUrl: "https://www.katyko.ru/", previewImage: "https://static.tildacdn.com/stor3832-3764-4364-a539-333463373133/e0d7abb422909f1bec4708dcc1cfcf30.png" },
  { slug: "caleb-sun", name: "Caleb Sun", role: "Brand Designer", externalUrl: "https://calebsun.co/", previewImage: "https://static.tildacdn.com/stor6236-6664-4533-b666-353837616532/8ad45b8c4948798d60747b6978704ea3.png" },
  { slug: "innocean-berlin", name: "Innocean Berlin", role: "Creative Agency", externalUrl: "https://innoceanberlin.com/", previewImage: "https://static.tildacdn.com/stor6336-3062-4639-a133-336333393463/13407c9fce12af0dc011b2bc87c48088.png" },
  { slug: "vladimir-pavlov", name: "Vladimir Pavlov", role: "Product & UI UX Designer", externalUrl: "https://vpavlov.com/", previewImage: "https://static.tildacdn.com/stor3638-3863-4232-a437-356164363137/255a47863eb1973ccc427b9eef82ab6f.png" },
  { slug: "dustin-brett", name: "Dustin Brett", role: "Developer", externalUrl: "https://dustinbrett.com/", previewImage: "https://static.tildacdn.com/stor3038-3134-4132-a233-666637666339/64946d97e8ca15b57e627cf3972686cc.png" },
  { slug: "sam-burton", name: "Sam Burton", role: "Motion Designer", externalUrl: "https://www.sambmotion.com/gifs", previewImage: "https://static.tildacdn.com/stor3632-6234-4935-b437-306166316136/f4dab7d6ba6ad277eb1651ae71375a28.png" },
  { slug: "grit-pictures", name: "Grit Pictures", role: "Agency", externalUrl: "https://grit.pictures/", previewImage: "https://static.tildacdn.com/stor3332-3336-4232-b365-366634626436/8e342e43b7bf879a31b09838a0257e08.png" },
  { slug: "robby-leonardi", name: "Robby Leonardi", role: "Multidisciplinary Designer", externalUrl: "http://www.rleonardi.com/interactive-resume/", previewImage: "https://static.tildacdn.com/stor3334-6431-4530-a665-623265386237/4a686ac371a47c4e91dfbb0c5d1922d8.png" },
  { slug: "irina-silanteva", name: "Ирина Силантьева", role: "Product & UI UX Designer", externalUrl: "https://herrusianeyes.tilda.ws/", previewImage: "https://static.tildacdn.com/stor3030-3738-4066-a332-363665343437/6e41a38488b9398aedbd91ac966c519a.png" },
  { slug: "eduardo-duccigne", name: "Eduardo Duccigne", role: "Product & UI UX Designer", externalUrl: "https://eduardoduccigne.co/", previewImage: "https://static.tildacdn.com/stor3566-6164-4138-b334-643366393636/a122823469bee113790513d34ec41fe9.png" },
  { slug: "joydeep-sengupta", name: "Joydeep Sengupta", role: "Product & UI UX Designer", externalUrl: "https://www.joydeeproni.com/", previewImage: "https://static.tildacdn.com/stor6638-3463-4433-b931-366266373339/cacdcfdfb3976b88e7450a26be6e01ad.png" },
  { slug: "ilia-izyanov", name: "Ilia Izyanov", role: "Product & UI UX Designer", externalUrl: "https://www.izyanov.com/", previewImage: "https://static.tildacdn.com/stor6361-3232-4836-a530-393863356462/3f1b219c5dc3e5a19b9c1504975db043.png" },
  { slug: "linear-studio", name: "Linear", role: "Branding Agency", externalUrl: "https://studiolinear.com/", previewImage: "https://static.tildacdn.com/stor6161-3631-4538-b862-333063656437/a8b73a7124e0f58df692aec030721900.png" },
  { slug: "franchec-crespo", name: "Franchec Crespo", role: "Digital Designer", externalUrl: "https://franchec.com/", previewImage: "https://static.tildacdn.com/stor6536-6537-4461-a631-626261623139/f81a3b8befce0a1be1cc7703d114ccd4.png" },
  { slug: "haoqiwen", name: "HaoqiWen", role: "Product & UI UX Designer", externalUrl: "https://haoqi.design/", previewImage: "https://static.tildacdn.com/stor3638-3339-4665-b832-383631646531/3c83c60ad2c166928a87b61ae617c7d3.png" },
  { slug: "matthew-vernon", name: "Matthew Vernon", role: "Product & UI UX Designer", externalUrl: "https://matthewvernon.co/", previewImage: "https://static.tildacdn.com/stor3762-3265-4238-b330-373566623066/02296f8eb5c4a65a16c12ffbddd6ce48.png" },
  { slug: "stephen-jude", name: "Stephen Jude", role: "Product & UI UX Designer", externalUrl: "https://www.creativestefan.work/", previewImage: "https://static.tildacdn.com/stor3064-3937-4334-a231-383062633237/36163280ff7d059def43d1af026676af.png" },
  { slug: "studio-freight", name: "Studio Freight", role: "Branding Agency", externalUrl: "https://studiofreight.com/", previewImage: "https://static.tildacdn.com/stor6432-6464-4335-b530-613861393366/976767d011cda49ec9f77488bb90769c.png" },
  { slug: "muharrem-senyil", name: "Muharrem Şenyıl", role: "Product & UI UX Designer", externalUrl: "https://senyil.com/", previewImage: "https://static.tildacdn.com/stor6462-3035-4463-a439-616536623162/5e287b15c265c18ea4d448ccbdb11373.png" },
  { slug: "ozzy", name: "Ozzy", role: "Product & UI UX Designer", externalUrl: "https://www.ozzyx.xyz/", previewImage: "https://static.tildacdn.com/stor3838-3666-4534-b065-643537613839/c16ca2d278cc7ab6261d001aba1a90b5.png" },
  { slug: "yahyavision", name: "Yahyavision", role: "Brand Designer", externalUrl: "https://yahyavision.com/", previewImage: "https://static.tildacdn.com/stor3062-6538-4839-b237-633932386664/9239c3d4be0e8d5ca8699abb0dfe41b1.png" },
  { slug: "daniel-ross", name: "Daniel Ross", role: "Brand Designer", externalUrl: "https://www.danielrossluft.com/", previewImage: "https://static.tildacdn.com/stor3766-3839-4963-a331-313438646138/94e491ff12e10e0cb6d303293894adab.png" },
  { slug: "claire-taylor", name: "Claire Taylor", role: "Product & UI UX Designer", externalUrl: "https://claire.io/", previewImage: "https://static.tildacdn.com/stor3930-6434-4361-b232-343637346364/f7fa3f47c0c7c9f543d0b27a0fad7d80.png" },
];

export function getCuratorBySlug(slug: string) {
  return curators.find((curator) => curator.slug === slug);
}
