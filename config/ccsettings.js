var settings = {

	general: {
		appname: 'Culture Chronicles',
		version: '0.0.1',
		user_agent: 'Culture Chronicles/0.0.1 ( http://my-awesome-app.com )',
		url: 'culturechronicles'
	},
	design: {
		defaultCover: 'http://90shiphop.com/Content/Images/Default/album_artwork.gif'
	},
	searchSettings: {

		resultLimit: 5,
		country: 'US',
		lastfm_api_key: '72e968612b23184d7c4e36f093a7ba46',
		lastfm_secret: 'bb32f797d9a4dc1fce00d9742de7f9e6',
		lastfm_root_url: 'http://ws.audioscrobbler.com/2.0/',
		rotten_api_key: 'vz6vpwy4ngpkfhxqmcrmfz23',

		// DUMP
		musicbrainz_root_url: 'http://musicbrainz.org',
		artist: 'tlc',
		track: 'unpretty',
		tlcMbid: '99790314-885a-4975-8614-9c5bc890364d',
		recordingMbid: '1970593f-d5e0-4bb9-9a25-985d44b1bc3e',
		releaseId: '2c036388-2df0-3b31-afde-818f695cc6eb',
		wolframAppId: 'EP79LE-EKV7TQ7W7H'

		//requestURL= musicbrainz_root_url + '/ws/2/artist/?query=artist:TLC&fmt=json',
	},
	errors: {
		defaultError: 'Undefined Error occured.',
		artistNotFound: 'Artist was not found.'
	}
};

module.exports = settings;