import { tw } from "../lib/tw";

export function HeroStory() {
  return (
    <div className={tw.story}>
      <p className="m-0">
        I&apos;m Duyet — a Senior AI/Data Engineer. I left Fossil as the AI era
        was starting, and joined Cartrack to do data engineering for real:
        stabilize everything on a large ClickHouse warehouse, then build AI on
        top of that foundation.
      </p>
      <p className="m-0">
        Later I shipped more of the work fully through coding agents — a loop
        that runs in production and keeps improving itself. I still steer
        architecture and review; the agents do a lot of the typing.
      </p>
      <p className="m-0">
        On the side I try a lot of ideas. Some run well. Some die quickly. I
        keep building anyway, and I still ship updates almost every day.
      </p>
    </div>
  );
}
