export interface Character {
  id: string;
  projectId: string;
  name: string;
  role: string;
  profileImage?: string; // 프로필 썸네일 (base64 또는 URL)
  illustrationImage?: string; // 메인 일러스트 (base64 또는 URL)
  image?: string; // 레거시 호환
  tags: string[];
  worldElementIds?: string[]; // 연결된 세계관 요소 ID 목록
  description: string;
  traits: CharacterTrait[];
  backstory: string;
  relationships: CharacterRelationship[];
  generatedContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterTrait {
  key: string;
  value: string;
}

export interface CharacterRelationship {
  characterId: string;
  type: string;
  description: string;
}
