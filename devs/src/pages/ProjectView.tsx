import { Component, css } from "dreamland/core";
import Header from "../components/Header";
import Logo from "../components/Logo";
import Project from "../types/Project";
import Stage from "../components/Stage";

const ProjectView: Component<{ project: Project }, {}> = function () {
	return (
		<main>
			<Stage pageHue={215} pageSat="60%" />
			<article>
				<Header />
				<div class="card">
					<h2 class="name">{this.project.name}</h2>
					<p class="description">{this.project.description}</p>
					{this.project.url && (
						<p>
							Website:{" "}
							<a
								href={this.project.url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{this.project.url}
							</a>
						</p>
					)}
					{this.project.repo && (
						<p>
							Repository:{" "}
							<a
								href={this.project.repo}
								target="_blank"
								rel="noopener noreferrer"
							>
								{this.project.repo}
							</a>
						</p>
					)}
				</div>
				<footer class="card">
					<Logo />
					<div>
						<p>
							Need help? Email us at{" "}
							<a href="mailto:support@adrenaline.dev">support@adrenaline.dev</a>
						</p>
					</div>
				</footer>
			</article>
		</main>
	);
};

ProjectView.style = css`
	article h2 {
		margin-top: 0;
	}

	.card {
		width: 100%;
		height: auto;
		margin-top: 1rem;
	}

	footer {
		margin-block: 1.66rem;
		display: flex;
		justify-content: space-between;
	}

	footer > div {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 1.1rem;
		text-align: right;
	}
`;

export default ProjectView;
