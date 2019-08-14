from .collectionv0 import CollectionV0Test
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from mdh_django.utils import LoadJSONAsset, AssetPath

DEMO_COLLECTION_PATH = AssetPath(__file__, "res", "collection_v1.json")
DEMO_COLLECTION_ASSET = LoadJSONAsset(DEMO_COLLECTION_PATH)


class UpdateCollectionTest(CollectionV0Test, TestCase):

    def setUp(self):
        """ Creates the demo collection using the upsert command """

        # create the collection
        super().setUp()

        # update the collection
        call_command('upsert_collection', DEMO_COLLECTION_PATH,
                     update=True, quiet=True)

    def test_api_all_collections(self):
        """ Checks that the demo collection was correctly updated in the list of collections """

        response = APIClient().get('/schema/collections/')
        expected_response = {
            "count": 1,
            "next": None,
            "previous": None,
            "num_pages": 1,
            "results": [DEMO_COLLECTION_ASSET]
        }

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_response)

    def test_api_exact_collection(self):
        """ Checks that the demo collection can be correctly found by slug """

        response = APIClient().get('/schema/collections/z4zFunctions/')
        expected_response = DEMO_COLLECTION_ASSET

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, expected_response)
