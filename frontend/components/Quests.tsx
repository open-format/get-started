import { MissionConfig } from "@/@types";

interface QuestProps {
  quests: MissionConfig[] | undefined;
  isLoading: boolean;
  title?: string;
}
export default function Quests({
  quests,
  isLoading,
  title = "Quests",
}: QuestProps) {
  if (isLoading)
    return (
      <div aria-live="assertive" aria-busy="true">
        Loading...
      </div>
    );

  return (
    <section id="achievements" className="main">
      <h2>{title}</h2>
      <ul className="quests__list">
        {quests && quests.length ? (
          quests.map((quest, index) => (
            <li key={`quest-${index}`} className="quests__item">
              <article className="quest">
                <div className="quest__details">
                  <div>
                    <h3 className="quest__id">{quest.id}</h3>
                    <p className="quest__description">
                      {quest.description}
                    </p>
                  </div>
                  <img
                    src={quest.badgeUrl}
                    className="quest__image"
                  />
                </div>
                <div className="quest__requirements">
                  <h4 className="quest__requirements-title">
                    Requirements
                  </h4>
                  <ul className="quest__requirements-list">
                    {quest.requirements.map(
                      (requirement, reqIndex) => (
                        <li
                          key={`requirement-${index}-${reqIndex}`}
                          className="quest__requirement"
                        >
                          {requirement.actionId}:{" "}
                          {requirement.description}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </article>
            </li>
          ))
        ) : (
          <li className="quests__item">No Quests Found.</li>
        )}
      </ul>
    </section>
  );
}
