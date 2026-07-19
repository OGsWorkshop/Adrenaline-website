import { render } from "dreamland/ssr/server";
import { jsxs, jsx } from "dreamland/jsx-runtime";
import { css, createState } from "dreamland/core";
import { router, Router, Route } from "dreamland/router";
import { router as router2 } from "dreamland/router";
const Logo = function() {
  return /* @__PURE__ */ jsxs("div", { class: "logo", children: [
    /* @__PURE__ */ jsx(
      "img",
      {
        src: "/devs/assets/ogsw.svg",
        alt: "OG's Workshop Logo",
        width: "50",
        height: "50"
      }
    ),
    /* @__PURE__ */ jsx(
      "a",
      {
        "on:click": (e) => {
          e.preventDefault();
          router.navigate("/");
        },
        children: /* @__PURE__ */ jsxs("h1", { children: [
          /* @__PURE__ */ jsx("span", { children: "OG's" }),
          /* @__PURE__ */ jsx("span", { class: "thin", children: "Workshop" })
        ] })
      }
    )
  ] });
};
Logo.style = css`:scope{display:flex;align-items:center;flex-direction:row;gap:1.1rem;user-select:none}a,a:visited{text-decoration:none;color:var(--fg)!important}@media (max-width:30rem){:scope{flex-direction:column}}@media (max-width:22rem){:scope h1{display:none}:scope{gap:0}}span{transition:color .25s ease,text-shadow .25s ease;cursor:pointer}img{transition:filter .25s ease;width:4.25rem;height:4.25rem}:scope:has(h1:hover) img,img:hover{filter:drop-shadow(0 0 .25rem rgba(255, 255, 255, .5))}h1:hover span{color:var(--accent);text-shadow:0 0 .5rem hsla(var(--accent-raw),.75)}h1:hover span.thin{color:var(--accent2);text-shadow:0 0 .5rem hsla(var(--accent2-raw),.75)}.thin{font-weight:400}h1,img{display:inline;margin:0}`;
const Header = function() {
  return /* @__PURE__ */ jsx("header", { class: "card", children: /* @__PURE__ */ jsx(Logo, {}) });
};
Header.style = css`:scope{display:flex;align-items:center;top:1rem;z-index:4;background:hsla(var(--bg2-raw),.4);backdrop-filter:blur(12px) saturate(1.4) brightness(.8)}@media (max-width:30rem){:scope{justify-content:center}}`;
const Stage = function() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      class: "stage",
      style: {
        "--page-hue": this.pageHue,
        "--page-sat": this.pageSat
      },
      children: /* @__PURE__ */ jsx("div", { class: "stage__beam" })
    }
  );
};
Stage.style = css`.stage{position:fixed;inset:0;width:100vw;height:120vh;min-height:100vh;overflow:hidden;transform-origin:center top;transform-origin:50% 0;z-index:-10;--color:hsla(var(--page-hue), var(--page-sat), 75%, 0.2);background:linear-gradient(to bottom,hsl(var(--page-hue),var(--page-sat),4%) 0,hsl(var(--page-hue),var(--page-sat),2%) 100%)}.stage__beam{transform:scaleY(1);position:absolute;inset:0;top:-15vh;width:100%;height:100%;background:conic-gradient(at 50% 5%,transparent 30%,var(--color) 40%,var(--color) 60%,transparent 70%),50% -25px/100% 100%;background-blend-mode:overlay;background-repeat:no-repeat;mix-blend-mode:screen;opacity:1;filter:blur(10px);-webkit-mask-image:radial-gradient(circle at 50% 0,#000 5%,transparent 80%);mask-image:radial-gradient(circle at 50% 0,#000 5%,transparent 80%)}@keyframes stage-breathe{0%,100%{opacity:.4;filter:blur(8px);transform:scaleY(1)}50%{opacity:1;filter:blur(12px);transform:scaleY(1.08)}}`;
const MemberCell = function(cx) {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: `/devs/member/${this.member.avatarName}`,
      class: "member-cell card interactable",
      "on:click": (e) => {
        e.preventDefault();
        router.navigate(cx.root.href);
      },
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            class: "avatar",
            src: `/devs/assets/pfps/${this.member.avatarName}.webp`,
            alt: `${this.member.name}'s avatar`,
            width: "100",
            height: "100"
          }
        ),
        /* @__PURE__ */ jsx("span", { class: "name", children: this.member.name })
      ]
    }
  );
};
MemberCell.style = css`:scope{display:flex;flex-direction:row;align-items:center;text-align:left;gap:.75rem;min-height:5rem;text-decoration:none!important}.avatar{border-radius:50%;width:2rem;height:2rem;object-fit:cover;box-shadow:0 0 0 .025rem rgba(255,255,255,.2)}.name{font-size:1.25rem;font-weight:700;color:var(--fg)!important;text-decoration:none!important}`;
const members = [
  {
    name: "Red60",
    bio: "Founder of OG's Workshop\nA high school student with an interest in programming and web development.",
    avatarName: "red",
    profileLinks: [
      {
        title: "github",
        content: "Red60Sapphire",
        url: "https://github.com/Red60sapphire/"
      },
      { title: "discord", content: "@music.ly", url: void 0 },
      { title: "IRL Name", content: "Rhythm", url: void 0 }
    ]
  },
  {
    name: "osamabinoven",
    bio: "Just another Furry doing cybersecurity.",
    avatarName: "luke",
    profileLinks: [
      {
        title: "site",
        content: "https://juggmylittlepony.site/",
        url: "https://juggmylittlepony.site/"
      },
      {
        title: "github",
        content: "osamabinoven",
        url: "https://github.com/osamabinoven"
      },
      { title: "discord", content: "@osamabinoven", url: void 0 },
      { title: "IRL Name", content: "Luke", url: void 0 }
    ]
  }
];
const ProjectCard = function(cx) {
  return /* @__PURE__ */ jsxs(
    "a",
    {
      class: "project-card card interactable",
      href: `project/${this.project.name}`,
      "on:click": (e) => {
        e.preventDefault();
        router.navigate(cx.root.href);
      },
      children: [
        /* @__PURE__ */ jsx("h3", { class: "name", children: this.project.name }),
        /* @__PURE__ */ jsx("p", { class: "description", children: this.project.description })
      ]
    }
  );
};
ProjectCard.style = css`:scope{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:.25rem;min-height:8rem;text-decoration:none;color:inherit}.name{font-size:1.5rem;font-weight:700;color:var(--fg);margin:0}.description{font-size:1rem;color:var(--fg2);margin:0}`;
const projects = [
  {
    name: "RedOS",
    description: "The next-gen webOS and development environment with full Linux emulation.",
    longDescription: void 0,
    screenshotURL: void 0,
    url: void 0,
    repo: "https://github.com/Red60sapphire/RedOS"
  },
  {
    name: "Infrared",
    description: "An experimental UBG site with many features.",
    longDescription: void 0,
    screenshotURL: void 0,
    url: void 0,
    repo: "https://github.com/OGsWorkshop/Infrared"
  }
];
const Homepage = function() {
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx(Stage, { pageHue: 310, pageSat: "35%" }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsx("h2", { children: "About Us" }),
      /* @__PURE__ */ jsx("section", { id: "about", children: /* @__PURE__ */ jsx("p", { children: "We're an organization of developers dedicated to writing free and open-source software for everyone." }) }),
      /* @__PURE__ */ jsx("h2", { children: "Our Projects" }),
      /* @__PURE__ */ jsx("section", { id: "projects", children: projects.map((project) => /* @__PURE__ */ jsx(ProjectCard, { project })) }),
      /* @__PURE__ */ jsx("h2", { children: "Members" }),
      /* @__PURE__ */ jsx("section", { id: "members", children: members.map((member) => /* @__PURE__ */ jsx(MemberCell, { member })) }),
      /* @__PURE__ */ jsxs("footer", { class: "card", children: [
        /* @__PURE__ */ jsx(Logo, {}),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Legal request? Contact",
            " ",
            /* @__PURE__ */ jsx("a", { href: "mailto:legal@mercurywork.shop", children: "legal@mercurywork.shop" })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Found a security issue? Contact",
            " ",
            /* @__PURE__ */ jsx("a", { href: "mailto:security@mercurywork.shop", children: "security@mercurywork.shop" })
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Need help or just want to contact the team? Email us at",
            " ",
            /* @__PURE__ */ jsx("a", { href: "mailto:support@mercurywork.shop", children: "support@mercurywork.shop" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { class: "konami", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", height: "0.5em", viewBox: "0 0 1021.2 71.6", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#fff4",
          d: "M808.7 70.7H773v-9.6h9.4V10.3H773V.7h35.5q6.3 0 11 2.15a18.3 18.3 0 0 1 4.859 3.188 16.4 16.4 0 0 1 2.491 2.912q2.65 3.95 2.65 9.35v1a21 21 0 0 1-.252 3.353q-.29 1.792-.913 3.269a11 11 0 0 1-.635 1.278q-1.8 3.1-4.35 4.8t-4.85 2.4V36a13 13 0 0 1 2.079.745q1.014.456 2.087 1.108a25 25 0 0 1 .784.497q2.65 1.75 4.5 4.85 1.53 2.564 1.795 6.427a25 25 0 0 1 .055 1.673v1a20.8 20.8 0 0 1-.535 4.829A15.8 15.8 0 0 1 827.1 62.2q-2.7 4.1-7.45 6.3a23.4 23.4 0 0 1-6.46 1.884 31 31 0 0 1-4.49.316m-776.4 0h-10V18.9l.7-4.4-1.5-.5-2.4 3.7L6.6 30.3 0 23.7 23.7 0h7.2l23.7 23.7-6.6 6.6-12.5-12.6-2.4-3.7-1.5.5.7 4.4zm87.5 0h-10V18.9l.7-4.4-1.5-.5-2.4 3.7-12.5 12.6-6.6-6.6L111.2 0h7.2l23.7 23.7-6.6 6.6L123 17.7l-2.4-3.7-1.5.5.7 4.4zm86.1.7h-7.2L175 47.7l6.6-6.6 12.5 12.6 2.4 3.7 1.5-.5-.7-4.4V.7h10v51.8l-.7 4.4 1.5.5 2.4-3.7L223 41.1l6.6 6.6zm87.5 0h-7.2l-23.7-23.7 6.6-6.6 12.5 12.6 2.4 3.7 1.5-.5-.7-4.4V.7h10v51.8l-.7 4.4 1.5.5 2.4-3.7 12.5-12.6 6.6 6.6zm87.1-6.3-6.6 6.5-23.2-23.1v-6.8l23.2-23.2 6.6 6.6-12.2 12.1-3.7 2.4.5 1.5 4.4-.7h51.8v9.4h-51.8l-4.4-.7-.5 1.5 3.7 2.4zm146.9-16.6-23.2 23.1-6.6-6.5L509.8 53l3.7-2.4-.5-1.5-4.4.7h-51.8v-9.4h51.8l4.4.7.5-1.5-3.7-2.4-12.2-12.1 6.6-6.6 23.2 23.2zm64.1 16.6-6.6 6.5-23.2-23.1v-6.8l23.2-23.2 6.6 6.6-12.2 12.1-3.7 2.4.5 1.5 4.4-.7h51.8v9.4h-51.8l-4.4-.7-.5 1.5 3.7 2.4zm146.9-16.6-23.2 23.1-6.6-6.5L720.8 53l3.7-2.4-.5-1.5-4.4.7h-51.8v-9.4h51.8l4.4.7.5-1.5-3.7-2.4-12.2-12.1 6.6-6.6 23.2 23.2zm133.7 22.2h-11.2l20-70h19l19.9 70h-11.1l-4.6-16.5h-27.4zm17.5-63.3-10.2 36.8h22L891.2 7.4zm-96.3 33v20.5h14.1a18 18 0 0 0 3.423-.304q1.981-.381 3.538-1.242A9.7 9.7 0 0 0 815.9 58.3q3.1-2.6 3.1-7.2v-.9a11.1 11.1 0 0 0-.411-3.108A8.3 8.3 0 0 0 815.95 43q-3.05-2.6-8.55-2.6zm0-29.9v20h14.1a16.6 16.6 0 0 0 3.407-.329q2.237-.468 3.952-1.601a10 10 0 0 0 .841-.62 8.33 8.33 0 0 0 3.068-6.075A12 12 0 0 0 818.7 21v-1q0-4.4-3.05-6.95a10.4 10.4 0 0 0-3.979-2.026q-1.915-.524-4.271-.524zm187.1 54.6-6.6 6.5-23.2-23.1v-6.8l23.2-23.2 6.6 6.6-12.2 12.1-3.7 2.4.5 1.5 4.4-.7h42.4V18.5h9.4v31.3h-51.8l-4.4-.7-.5 1.5 3.7 2.4z"
        }
      ) }) })
    ] })
  ] });
};
Homepage.style = css`#projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(20rem,1fr));gap:1rem}#members{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem}footer{margin-block:1.66rem;display:flex;justify-content:space-between}footer>div{display:flex;flex-direction:column;gap:.25rem;font-size:1.1rem;text-align:right}.konami{display:flex;justify-content:center}`;
const MemberView = function() {
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx(Stage, { pageHue: 215, pageSat: "15%" }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsxs("div", { class: "info card", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            class: "pfp",
            src: `/devs/assets/pfps/${this.member.avatarName}.webp`,
            alt: `${this.member.name}'s avatar`,
            width: "90",
            height: "90"
          }
        ),
        /* @__PURE__ */ jsxs("div", { class: "details", children: [
          /* @__PURE__ */ jsx("h2", { class: "name", children: this.member.name }),
          /* @__PURE__ */ jsx("p", { class: "bio", children: this.member.bio })
        ] })
      ] }),
      this.member.profileLinks.length > 0 && /* @__PURE__ */ jsx("section", { id: "profile-links", children: this.member.profileLinks.map(
        (link) => link.url ? /* @__PURE__ */ jsxs(
          "a",
          {
            class: "profile-link card interactable",
            href: link.url,
            target: "_blank",
            rel: "me",
            children: [
              /* @__PURE__ */ jsx("span", { class: "title", children: link.title }),
              /* @__PURE__ */ jsx("span", { class: "content", children: link.content })
            ]
          }
        ) : /* @__PURE__ */ jsxs("div", { class: "profile-link card", children: [
          /* @__PURE__ */ jsx("span", { class: "title", children: link.title }),
          /* @__PURE__ */ jsx("span", { class: "content", children: link.content })
        ] })
      ) })
    ] })
  ] });
};
MemberView.style = css`:scope{display:block}.pfp{border-radius:50%}.info{display:flex;align-items:center;gap:1rem;margin-top:1rem}article h2{margin:0}#profile-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:1rem;margin-top:1rem}.profile-link{display:flex;flex-direction:column;gap:.25rem;text-decoration:none;color:var(--text)}.profile-link .title{font-size:.9em;font-weight:700;font-family:var(--font-display);color:var(--fg2)}.profile-link .content{font-size:.95rem;color:var(--fg)!important;word-break:break-word}`;
const NotFoundView = function() {
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx(Stage, { pageHue: 340, pageSat: "45%" }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsx("h1", { children: "404" }),
      /* @__PURE__ */ jsx("p", { children: "The page you are looking for does not exist." })
    ] })
  ] });
};
NotFoundView.style = css`article h1{font-size:15vw;margin:1rem}article p{font-size:1.5rem}article{inset:0;overflow:0;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}`;
const ProjectView = function() {
  return /* @__PURE__ */ jsxs("main", { children: [
    /* @__PURE__ */ jsx(Stage, { pageHue: 215, pageSat: "60%" }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsxs("div", { class: "card", children: [
        /* @__PURE__ */ jsx("h2", { class: "name", children: this.project.name }),
        /* @__PURE__ */ jsx("p", { class: "description", children: this.project.description }),
        this.project.url && /* @__PURE__ */ jsxs("p", { children: [
          "Website:",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              href: this.project.url,
              target: "_blank",
              rel: "noopener noreferrer",
              children: this.project.url
            }
          )
        ] }),
        this.project.repo && /* @__PURE__ */ jsxs("p", { children: [
          "Repository:",
          " ",
          /* @__PURE__ */ jsx(
            "a",
            {
              href: this.project.repo,
              target: "_blank",
              rel: "noopener noreferrer",
              children: this.project.repo
            }
          )
        ] })
      ] })
    ] })
  ] });
};
ProjectView.style = css`article h2{margin-top:0}.card{width:100%;height:auto;margin-top:1rem}`;
let page = createState({});
const App = function(cx) {
  cx.init = () => {
    {
      router.route(page.url, "http://127.0.0.1:5173");
    }
  };
  return /* @__PURE__ */ jsxs("div", { id: "app", children: [
    /* @__PURE__ */ jsxs(Router, { children: [
      /* @__PURE__ */ jsx(Route, { show: /* @__PURE__ */ jsx(Homepage, {}) }),
      ...members.map((member) => /* @__PURE__ */ jsx(Route, { path: `devs/member/${member.avatarName}`, show: /* @__PURE__ */ jsx(MemberView, { member }) })),
      ...projects.map((project) => /* @__PURE__ */ jsx(Route, { path: `devs/project/${project.name}`, show: /* @__PURE__ */ jsx(ProjectView, { project }) })),
      /* @__PURE__ */ jsx(Route, { path: "*", show: /* @__PURE__ */ jsx(NotFoundView, {}) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: "width: 0; height: 0; overflow: hidden;", children: /* @__PURE__ */ jsx("video", { id: "clocks", disablepictureinpicture: true, disableremoteplayback: true, children: /* @__PURE__ */ jsx("source", { src: "/devs/assets/clocks.mp4", type: "video/mp4", preload: "auto" }) }) })
  ] });
};
App.style = css`:scope{margin:0;--page-hs:var(--page-hue),var(--page-sat)}#clocks{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(0turn) scale(0);transform-origin:center;padding:1px;transition:transform .5s ease;visibility:hidden;box-shadow:0 0 2rem 1rem hsla(var(--fg-raw),.2);border:none;border-radius:1rem;z-index:10}#clocks.playing{transform:translate(-50%,-50%) rotate(1turn) scale(1);visibility:visible}#clocks.ending{transform:translate(-50%,-50%) rotate(0turn) scale(0);visibility:visible}`;
const App$1 = (path) => {
  page.url = path;
  return /* @__PURE__ */ jsx(App, {});
};
const mainServer = (path) => render(() => App$1(path));
export {
  mainServer as default,
  router2 as router
};
