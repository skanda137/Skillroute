export interface AuthConfig {
  type: "bearer" | "api_key";
  token_env?: string;
  key_env?: string;
}

export default class Skill {
  id!: number;
  name!: string;
  version?: string;
  endpoint?: string;
  timeoutMs?: number;
  isActive!: boolean;
  authConfig?: AuthConfig;

  private static store: Skill[] = [];

  static async create(data: any): Promise<Skill> {
    const skill = new Skill();
    Object.assign(skill, data);
    skill.id = this.store.length + 1;
    skill.isActive = true;
    this.store.push(skill);
    return skill;
  }

  static async findByPk(id: number): Promise<Skill | null> {
    return this.store.find(s => s.id === id) ?? null;
  }

  static async findAll({ where }: { where?: any } = {}): Promise<Skill[]> {
    if (!where || Object.keys(where).length === 0) {
      return this.store;
    }

    return this.store.filter(skill =>
      Object.entries(where).every(
        ([key, value]) => (skill as any)[key] === value
      )
    );
  }

  async update(updates: any): Promise<void> {
    Object.assign(this, updates);
  }
}
