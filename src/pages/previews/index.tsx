// import Preview from "@/pages/previews/aliyun_video";
import Preview from "@/components/video";
import { useRouter } from "next/router";
import { Flex, Button, Space, Input, Card } from "antd";
import { useState } from "react";

export default function Previews() {
  const router = useRouter()
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div style={{width: "min(99%, 980px)"}}>
      <Flex vertical gap="middle" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
        <div></div>
        <Space direction="horizontal">
          <Input.Password
            placeholder="input password"
            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
          />
          <Button style={{ width: 80 }} onClick={() => setPasswordVisible((prevState) => !prevState)}>
            {passwordVisible ? 'Hide' : 'Show'}
          </Button>
        </Space>
        <Space direction="horizontal">
          <Input.Password
            placeholder="input password"
            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
          />
          <Button style={{ width: 80 }} onClick={() => setPasswordVisible((prevState) => !prevState)}>
            {passwordVisible ? 'Hide' : 'Show'}
          </Button>
        </Space>
        <Card style={{ marginTop: "20px", height: "560px"}}>
          <Preview />
        </Card>
      </Flex>
    </div>
  )
}
