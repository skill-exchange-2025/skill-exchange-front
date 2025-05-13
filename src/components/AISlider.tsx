import React, {useState} from 'react';
import {Slider, Tooltip} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';

interface AISliderProps {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    tooltip?: string;
}

const AISlider: React.FC<AISliderProps> = ({
                                               min = 0,
                                               max = 100,
                                               step = 1,
                                               defaultValue = 50,
                                               onChange,
                                               tooltip = 'Adjust the AI intensity'
                                           }) => {
    const [value, setValue] = useState(defaultValue);

    const handleChange = (newValue: number) => {
        setValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">AI Intensity</span>
                    <Tooltip title={tooltip}>
                        <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                </div>
                <Slider
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    tooltip={{
                        formatter: (value) => `${value}%`
                    }}
                />
            </div>
            <div className="w-12 text-center">
                <span className="text-lg font-semibold">{value}%</span>
            </div>
        </div>
    );
};

export default AISlider;