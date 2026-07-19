import Member from "./types/Member";

export const members: Member[] = [
	{
		name: "Red60",
		bio: "Founder of OG's Workshop\nA high school student with an interest in programming and web development.",
		avatarName: "red",
		profileLinks: [
			{
				title: "github",
				content: "Red60Sapphire",
				url: "https://github.com/Red60sapphire/",
			},
			{ title: "discord", content: "@music.ly", url: undefined },
			{ title: "IRL Name", content: "Rhythm", url: undefined },
		],
	},
	{
		name: "osamabinoven",
		bio: "Just another Furry doing cybersecurity.",
		avatarName: "luke",
		profileLinks: [
			{
				title: "site",
				content: "https://juggmylittlepony.site/",
				url: "https://juggmylittlepony.site/",
			},
			{
				title: "github",
				content: "osamabinoven",
				url: "https://github.com/osamabinoven",
			},
			{ title: "discord", content: "@osamabinoven", url: undefined },
			{ title: "IRL Name", content: "Luke", url: undefined },
		],
	},
]