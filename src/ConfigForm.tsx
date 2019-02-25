import * as React from 'react';
import {Config} from './Config';
import {noop} from './util';

export interface ConfigFormProps {
  config: Config;
  onChangeConfig?: (config: Config) => void;
}

export function ConfigForm({config, onChangeConfig = noop}: ConfigFormProps) {
  return (
    <>
      <div>
        <label>
          width:{' '}
          <input
            type="number"
            value={config.width}
            onChange={(e) => onChangeConfig({...config, width: e.target.valueAsNumber})}
            min="10"
            step="1"
            style={{width: '60px'}}
          />
        </label>
      </div>
      <div>
        <label>
          height:{' '}
          <input
            type="number"
            value={config.height}
            onChange={(e) => onChangeConfig({...config, height: e.target.valueAsNumber})}
            min="10"
            step="1"
            style={{width: '60px'}}
          />
        </label>
      </div>
      <div>
        <label>
          rate:{' '}
          <input
            type="number"
            value={config.rate}
            onChange={(e) => onChangeConfig({...config, rate: e.target.valueAsNumber})}
            min="0.01"
            max="1"
            step="0.01"
            style={{width: '60px'}}
          />
        </label>
      </div>
    </>
  );
}
