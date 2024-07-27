interface IForumMainSection {
    id: number;
    name: string;
    createdAt: string;
    editedAt: string;
    topic: IForumSubSection[];
  }
  
  interface IForumSubSection {
    id: number;
    idMain: number;
    name: string;
    themes: number;
    messages: number;
    createdAt: string;
    editedAt: string;
  }
  