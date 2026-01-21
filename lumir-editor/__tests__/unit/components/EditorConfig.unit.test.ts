import { describe, it, expect } from 'vitest';
import { EditorConfig } from '../../../src/components/LumirEditor';

describe('EditorConfig', () => {
  describe('getDefaultTableConfig', () => {
    it('설정 없으면 모든 옵션이 true이다', () => {
      const config = EditorConfig.getDefaultTableConfig();
      expect(config).toEqual({
        splitCells: true,
        cellBackgroundColor: true,
        cellTextColor: true,
        headers: true,
      });
    });

    it('일부 설정 시 병합한다', () => {
      const config = EditorConfig.getDefaultTableConfig({
        splitCells: false,
      });
      expect(config).toEqual({
        splitCells: false,
        cellBackgroundColor: true,
        cellTextColor: true,
        headers: true,
      });
    });

    it('모든 옵션을 false로 설정할 수 있다', () => {
      const config = EditorConfig.getDefaultTableConfig({
        splitCells: false,
        cellBackgroundColor: false,
        cellTextColor: false,
        headers: false,
      });
      expect(config).toEqual({
        splitCells: false,
        cellBackgroundColor: false,
        cellTextColor: false,
        headers: false,
      });
    });

    it('undefined 옵션은 기본값을 사용한다', () => {
      const config = EditorConfig.getDefaultTableConfig({
        splitCells: undefined,
        cellBackgroundColor: false,
      });
      expect(config.splitCells).toBe(true);
      expect(config.cellBackgroundColor).toBe(false);
    });
  });

  describe('getDefaultHeadingConfig', () => {
    it('설정 없으면 [1,2,3,4,5,6]이다', () => {
      const config = EditorConfig.getDefaultHeadingConfig();
      expect(config.levels).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('빈 levels면 기본값을 사용한다', () => {
      const config = EditorConfig.getDefaultHeadingConfig({ levels: [] });
      expect(config.levels).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('사용자 설정을 유지한다', () => {
      const config = EditorConfig.getDefaultHeadingConfig({ levels: [1, 2, 3] });
      expect(config.levels).toEqual([1, 2, 3]);
    });

    it('undefined 입력시 기본값을 사용한다', () => {
      const config = EditorConfig.getDefaultHeadingConfig(undefined);
      expect(config.levels).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it('단일 레벨만 설정할 수 있다', () => {
      const config = EditorConfig.getDefaultHeadingConfig({ levels: [1] });
      expect(config.levels).toEqual([1]);
    });
  });

  describe('getDisabledExtensions', () => {
    it('사용자 확장을 병합한다', () => {
      const extensions = EditorConfig.getDisabledExtensions(
        ['customExt1', 'customExt2'],
        true,
        true,
        true
      );
      expect(extensions).toContain('customExt1');
      expect(extensions).toContain('customExt2');
    });

    it('allowVideo=false면 video를 추가한다', () => {
      const extensions = EditorConfig.getDisabledExtensions([], false, true, true);
      expect(extensions).toContain('video');
    });

    it('allowAudio=false면 audio를 추가한다', () => {
      const extensions = EditorConfig.getDisabledExtensions([], true, false, true);
      expect(extensions).toContain('audio');
    });

    it('allowFile=false면 file을 추가한다', () => {
      const extensions = EditorConfig.getDisabledExtensions([], true, true, false);
      expect(extensions).toContain('file');
    });

    it('모든 허용=true면 사용자 확장만 반환한다', () => {
      const extensions = EditorConfig.getDisabledExtensions(
        ['custom'],
        true,
        true,
        true
      );
      expect(extensions).toEqual(['custom']);
      expect(extensions).not.toContain('video');
      expect(extensions).not.toContain('audio');
      expect(extensions).not.toContain('file');
    });

    it('중복을 제거한다', () => {
      const extensions = EditorConfig.getDisabledExtensions(
        ['video', 'audio'],
        false,
        false,
        true
      );
      const videoCount = extensions.filter((e) => e === 'video').length;
      const audioCount = extensions.filter((e) => e === 'audio').length;
      expect(videoCount).toBe(1);
      expect(audioCount).toBe(1);
    });

    it('기본값으로 모든 미디어를 비활성화한다', () => {
      const extensions = EditorConfig.getDisabledExtensions();
      expect(extensions).toContain('video');
      expect(extensions).toContain('audio');
      expect(extensions).toContain('file');
    });

    it('빈 사용자 확장과 모든 false 플래그', () => {
      const extensions = EditorConfig.getDisabledExtensions([], false, false, false);
      expect(extensions).toEqual(expect.arrayContaining(['video', 'audio', 'file']));
      expect(extensions).toHaveLength(3);
    });

    it('undefined 사용자 확장 처리', () => {
      const extensions = EditorConfig.getDisabledExtensions(undefined, true, true, true);
      expect(extensions).toEqual([]);
    });
  });
});
