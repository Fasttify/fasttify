import { generateClient } from 'aws-amplify/data';
import type { StoreSchema } from '../../../data/resource';
import defaultPages from '../config/defaultPages.json';
import { DefaultPage } from '../types/index';

export const createDefaultPages = async (
  client: ReturnType<typeof generateClient<StoreSchema>>,
  storeId: string,
  owner: string
): Promise<string[]> => {
  try {
    const createdPageIds: string[] = [];

    for (const pageConfig of defaultPages as DefaultPage[]) {
      try {
        const page = await client.models.Page.create({
          storeId: storeId,
          title: pageConfig.title,
          content: pageConfig.content,
          slug: pageConfig.slug,
          isVisible: pageConfig.isVisible,
          status: pageConfig.status,
          pageType: pageConfig.pageType,
          owner: owner,
        });

        if (page.data?.id) {
          createdPageIds.push(page.data.id);
        }
      } catch (pageError) {
        console.error(`Error creating page ${pageConfig.title}:`, pageError);
      }
    }

    return createdPageIds;
  } catch (error) {
    console.error('Error creating default pages:', error);
    return [];
  }
};
