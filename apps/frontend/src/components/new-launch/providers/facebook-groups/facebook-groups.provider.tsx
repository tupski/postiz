'use client';

import {
  PostComment,
  withProvider,
} from '@gitroom/frontend/components/new-launch/providers/high.order.provider';
import { FacebookDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { Input } from '@gitroom/react/form/input';
import { useSettings } from '@gitroom/frontend/components/launches/helpers/use.values';

export const FacebookGroupsSettings = () => {
  const { register } = useSettings();

  return (
    <Input
      label={
        'Embedded URL (only for text Post)'
      }
      {...register('url')}
    />
  );
};

export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: FacebookGroupsSettings,
  CustomPreviewComponent: undefined,
  dto: FacebookDto,
  checkValidity: undefined,
  maximumCharacters: 63206,
});
