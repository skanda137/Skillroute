import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SkillAttributes {
  id: number;
  name: string;
  version: string;
  type: string;
  description: string | null;
  endpoint: string | null;
  inputs: object;
  outputs: object;
  authConfig: object | null;
  timeoutMs: number;
  isActive: boolean;
  capabilities: string[];
  metadata: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SkillCreationAttributes extends Optional<SkillAttributes, 'id' | 'description' | 'endpoint' | 'authConfig' | 'timeoutMs' | 'isActive' | 'capabilities' | 'metadata'> {}

class Skill extends Model<SkillAttributes, SkillCreationAttributes> implements SkillAttributes {
  public id!: number;
  public name!: string;
  public version!: string;
  public type!: string;
  public description!: string | null;
  public endpoint!: string | null;
  public inputs!: object;
  public outputs!: object;
  public authConfig!: object | null;
  public timeoutMs!: number;
  public isActive!: boolean;
  public capabilities!: string[];
  public metadata!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Skill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    endpoint: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    inputs: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    outputs: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    authConfig: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'auth_config'
    },
    timeoutMs: {
      type: DataTypes.INTEGER,
      defaultValue: 10000,
      field: 'timeout_ms'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    capabilities: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    sequelize,
    tableName: 'skills',
    timestamps: true,
    underscored: true
  }
);

export default Skill;