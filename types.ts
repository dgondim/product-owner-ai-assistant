
export interface BddScenario {
  scenario: string;
  given: string;
  when: string;
  then: string;
}

export interface JiraStory {
  title: string;
  userStory: string;
  acceptanceCriteria: string[];
  bddScenarios: BddScenario[];
}

export interface Epic {
  epicTitle: string;
  stories: JiraStory[];
}

export enum OutputTab {
  UI_PROTOTYPE = 'UI_PROTOTYPE',
  JIRA_STORIES = 'JIRA_STORIES',
  STORY_BOARD = 'STORY_BOARD',
}
