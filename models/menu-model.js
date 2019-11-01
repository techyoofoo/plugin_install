import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema(
  {
    parent_node: {
      type: String,
      default: 0
    },
    menu_name:{
      type: String
    },
    status: {
      type: String,
      enum:['Active', 'In-Active'],
      default:'Active'
    }
  },
  {
    timestamps: true
  }
);
menuSchema.methods = {
  view(full) {
    const view = {
      // simple view
      id: this.id,
      parent_node: this.parent_node,
      menu_name: this.menu_name,
      status: this.status
    };

    return full
      ? {
          ...view
        }
      : view;
  }
};
const model = mongoose.model("menu", menuSchema);

export const schema = model.schema;
export default model;
