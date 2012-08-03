insert into CooComicServerComicURL (vol, capture, page, quality_rank, url, fetch_time, comic_id, is_local_back, vol_capture_name) select vol, capture, page, quality_rank, url, fetch_time, comic_id, is_local_back, vol_capture_name from CooComicServerComicURL_local;

insert into CooComicServerComicURLV2 (vol, capture, page, quality_rank, url, fetch_time, comic_id, is_local_back, vol_capture_name) select vol, capture, page, quality_rank, url, fetch_time, comic_id, is_local_back, vol_capture_name from CooComicServerComicURLV2_local;
