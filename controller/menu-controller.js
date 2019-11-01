import Menu from "../models/menu-model";

export const createMenu = async (request, h) => {
  try {
    const menuPayload = new Menu(request.payload);
    const saveMenuData = await menuPayload.save();
    return h.response({
      Message: saveMenuData.menu_name + " saved successfully ",
      status: 200
    });
  } catch (error) {
    return h.response(error).code(500);
  }
};

export const getMenuList = async (request, h) => {
  try {
    const lstAllUsers = await Menu.find({}).select(
      "-createdAt -updatedAt -__v"
    );
    let menuData = [
      {
        menu_name: "Plugins",
        child_node: [
          {
            menu_name: "Install",
            path_name: "install"
          },
          {
            menu_name: "Un-Install",
            path_name: "uninstall"
          }
        ]
      },
      {
        menu_name: "Comissions",
        child_node: [
          {
            menu_name: "Comissions",
            path_name: "commissions"
          },
          {
            menu_name: "Ranking",
            path_name: "rank"
          },
          {
            menu_name: "Volume",
            path_name: "volumes"
          }
        ]
      }
    ];

    return h.response(menuData);
  } catch (error) {
    return h.response(error).code(500);
  }
};
