import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Skill from './Skill';

interface SkillRouteAttributes {
  id: number;
  userId: number | null;
  requestId: string;
  inputText: string;
  context: object;
  selectedSkillId: number | null;
  confidenceScore: number | null;
  responseData: object | null;
  status: string;
  executionTimeMs: number | null;
  errorMessage: string | null;
  metadata: object;
  createdAt?: Date;
}

interface SkillRouteCreationAttributes extends Optional<SkillRouteAttributes, 'id' | 'userId' | 'context' | 'selectedSkillId' | 'confidenceScore' | 'responseData' | 'status' | 'executionTimeMs' | 'errorMessage' | 'metadata'> {}

class SkillRoute extends Model<SkillRouteAttributes, SkillRouteCreationAttributes> implements SkillRouteAttributes {
  public id!: number;
  public userId!: number | null;
  public requestId!: string;
  public inputText!: string;
  public context!: object;
  public selectedSkillId!: number | null;
  public confidenceScore!: number | null;
  public responseData!: object | null;
  public status!: string;
  public executionTimeMs!: number | null;
  public errorMessage!: string | null;
  public metadata!: object;
  public readonly createdAt!: Date;
}

SkillRoute.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    requestId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'request_id'
    },
    inputText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'input_text'
    },
    context: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    selectedSkillId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'selected_skill_id',
      references: {
        model: 'skills',
        key: 'id'
      }
    },
    confidenceScore: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      field: 'confidence_score'
    },
    responseData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'response_data'
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'success', 'failed', 'timeout']]
      }
    },
    executionTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'execution_time_ms'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  },
  {
    sequelize,
    tableName: 'skill_routes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true
  }
);

// Associations
SkillRoute.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SkillRoute.belongsTo(Skill, { foreignKey: 'selectedSkillId', as: 'skill' });

export default SkillRoute;