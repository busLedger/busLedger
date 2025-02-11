import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";

export const Load = () => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48, color:"#725EFF" }} spin />; 

  return (
    <Flex align="center" justify="center" className="h-screen bg-dark-purple">
      <Spin indicator={antIcon} />
    </Flex>
  );
};
