import {
  AnalyticsData,
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from '@gitroom/nestjs-libraries/integrations/social/social.integrations.interface';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import dayjs from 'dayjs';
import { SocialAbstract } from '@gitroom/nestjs-libraries/integrations/social.abstract';
import { FacebookDto } from '@gitroom/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';

export class FacebookGroupsProvider extends SocialAbstract implements SocialProvider {
  identifier = 'facebook-groups';
  name = 'Facebook Groups';
  isBetweenSteps = true;
  editor = 'normal' as const;
  scopes = [
    'groups_access_member_info',
    'publish_to_groups',
    'user_posts',
    'user_photos',
    'user_videos',
  ];
  override maxConcurrentJob = 3; // Facebook has reasonable rate limits

  async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
    return {
      refreshToken: '',
      expiresIn: 0,
      accessToken: '',
      id: '',
      name: '',
      picture: '',
      username: '',
    };
  }

  async generateAuthUrl() {
    const state = makeId(6);
    return {
      url:
        'https://www.facebook.com/v20.0/dialog/oauth' +
        `?client_id=${process.env.FACEBOOK_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(
          `${process.env.FRONTEND_URL}/integrations/social/facebook-groups`
        )}` +
        `&state=${state}` +
        `&scope=${this.scopes.join(',')}`,
      codeVerifier: makeId(10),
      state,
    };
  }

  async authenticate(params: {
    code: string;
    codeVerifier: string;
    refresh?: string;
  }) {
    const getAccessToken = await (
      await fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          `?client_id=${process.env.FACEBOOK_APP_ID}` +
          `&redirect_uri=${encodeURIComponent(
            `${process.env.FRONTEND_URL}/integrations/social/facebook-groups${
              params.refresh ? `?refresh=${params.refresh}` : ''
            }`
          )}` +
          `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
          `&code=${params.code}`
      )
    ).json();

    const { access_token } = await (
      await fetch(
        'https://graph.facebook.com/v20.0/oauth/access_token' +
          '?grant_type=fb_exchange_token' +
          `&client_id=${process.env.FACEBOOK_APP_ID}` +
          `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
          `&fb_exchange_token=${getAccessToken.access_token}&fields=access_token,expires_in`
      )
    ).json();

    const { data } = await (
      await fetch(
        `https://graph.facebook.com/v20.0/me/permissions?access_token=${access_token}`
      )
    ).json();

    const permissions = data
      .filter((d: any) => d.status === 'granted')
      .map((p: any) => p.permission);
    this.checkScopes(this.scopes, permissions);

    const {
      id,
      name,
      picture
    } = await (
      await fetch(
        `https://graph.facebook.com/v20.0/me?fields=id,name,picture&access_token=${access_token}`
      )
    ).json();

    return {
      id,
      name,
      accessToken: access_token,
      refreshToken: access_token,
      expiresIn: dayjs().add(59, 'days').unix() - dayjs().unix(),
      picture: picture?.data?.url || '',
      username: '',
    };
  }

  async reConnect(
    id: string,
    requiredId: string,
    accessToken: string
  ): Promise<AuthTokenDetails> {
    const information = await this.fetchGroupInformation(
      accessToken,
      requiredId
    );

    return {
      id: information.id,
      name: information.name,
      accessToken: accessToken,
      refreshToken: accessToken,
      expiresIn: dayjs().add(59, 'days').unix() - dayjs().unix(),
      picture: information.picture,
      username: information.name,
    };
  }

  async groups(accessToken: string) {
    const { data } = await (
      await fetch(
        `https://graph.facebook.com/v20.0/me/groups?fields=id,name,picture.type(large),privacy,member_count&access_token=${accessToken}`
      )
    ).json();

    return data;
  }

  async fetchGroupInformation(accessToken: string, groupId: string) {
    const {
      id,
      name,
      picture,
      privacy,
      member_count,
    } = await (
      await fetch(
        `https://graph.facebook.com/v20.0/${groupId}?fields=id,name,picture.type(large),privacy,member_count&access_token=${accessToken}`
      )
    ).json();

    return {
      id,
      name,
      picture: picture?.data?.url || '',
      privacy,
      member_count,
    };
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails<FacebookDto>[]
  ): Promise<PostResponse[]> {
    const [firstPost, ...comments] = postDetails;

    let finalId = '';
    let finalUrl = '';

    // Upload media jika ada
    const uploadPhotos = !firstPost?.media?.length
      ? []
      : await Promise.all(
          firstPost.media.map(async (media) => {
            if (media.path.indexOf('mp4') > -1) {
              // Video upload untuk grup
              const { id: videoId } = await (
                await this.fetch(
                  `https://graph.facebook.com/v20.0/${id}/videos?access_token=${accessToken}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      file_url: media.path,
                      description: firstPost.message,
                      published: false,
                    }),
                  },
                  'upload video to group'
                )
              ).json();

              return { media_fbid: videoId };
            } else {
              // Photo upload untuk grup
              const { id: photoId } = await (
                await this.fetch(
                  `https://graph.facebook.com/v20.0/${id}/photos?access_token=${accessToken}`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      url: media.path,
                      published: false,
                    }),
                  },
                  'upload photo to group'
                )
              ).json();

              return { media_fbid: photoId };
            }
          })
        );

    // Post ke grup Facebook
    const {
      id: postId,
      permalink_url,
    } = await (
      await this.fetch(
        `https://graph.facebook.com/v20.0/${id}/feed?access_token=${accessToken}&fields=id,permalink_url`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(uploadPhotos?.length ? { attached_media: uploadPhotos } : {}),
            ...(firstPost?.settings?.url
              ? { link: firstPost.settings.url }
              : {}),
            message: firstPost.message,
            published: true,
          }),
        },
        'post to facebook group'
      )
    ).json();

    finalUrl = permalink_url;
    finalId = postId;

    // Handle comments jika ada
    const postsArray = [];
    let commentId = finalId;
    for (const comment of comments) {
      const data = await (
        await this.fetch(
          `https://graph.facebook.com/v20.0/${commentId}/comments?access_token=${accessToken}&fields=id,permalink_url`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...(comment.media?.length
                ? { attachment_url: comment.media[0].path }
                : {}),
              message: comment.message,
            }),
          },
          'add comment to group post'
        )
      ).json();

      commentId = data.id;
      postsArray.push({
        id: comment.id,
        postId: data.id,
        releaseURL: data.permalink_url,
        status: 'success',
      });
    }

    return [
      {
        id: firstPost.id,
        postId: finalId,
        releaseURL: finalUrl,
        status: 'success',
      },
      ...postsArray,
    ];
  }

  async analytics(
    id: string,
    accessToken: string,
    date: number
  ): Promise<AnalyticsData[]> {
    // Facebook Groups memiliki analytics terbatas
    // Kita akan return basic analytics
    return [
      {
        date: dayjs().format('YYYY-MM-DD'),
        value: 0,
        name: 'Group Posts',
      },
    ];
  }
}
