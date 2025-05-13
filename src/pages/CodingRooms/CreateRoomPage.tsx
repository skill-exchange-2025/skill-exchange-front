// src/pages/CodingRooms/CreateRoomPage.tsx
import React from 'react';
import { useCreateRoom } from '@/hooks/useCreateRoom';
import { Button, Card, Form, Input, Select, Switch, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const CreateRoomPage: React.FC = () => {
  const {
    formData,
    tag,
    isSubmitting = false,
    handleInputChange,
    handleSwitchChange,
    handleSelectChange,
    addTag,
    removeTag,
    handleTagKeyDown,
    handleSubmit,
    setTag,
  } = useCreateRoom();
  

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Create New Coding Room" className="max-w-2xl mx-auto">
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Room Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a room name' }]}
          >
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter room name"
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter room description"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            label="Programming Language"
            name="language"
            rules={[{ required: true, message: 'Please select a programming language' }]}
          >
            <Select
              value={formData.language}
              onChange={(value) => handleSelectChange('language', value)}
            >
              <Option value="javascript">JavaScript</Option>
              <Option value="python">Python</Option>
              <Option value="java">Java</Option>
              <Option value="cpp">C++</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Editor Theme" name="theme">
            <Select
              value={formData.theme}
              onChange={(value) => handleSelectChange('theme', value)}
            >
              <Option value="vs-dark">VS Dark</Option>
              <Option value="vs-light">VS Light</Option>
              <Option value="hc-black">High Contrast</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Tags">
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => removeTag(tag)}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tags (press Enter)"
              suffix={
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={addTag}
                />
              }
            />
          </Form.Item>

          <Form.Item label="Private Room" name="isPrivate">
            <Switch
              checked={formData.isPrivate}
              onChange={handleSwitchChange}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="w-full"
            >
              Create Room
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateRoomPage;
