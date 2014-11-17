package com.chiefmech.handler.weixin;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

import com.chiefmech.utils.MessageFactory;
import com.chiefmech.wxmsg.resp.BaseMsg;

public class MenuClickMsgHandler {
	private static Logger logger = Logger.getLogger(MenuClickMsgHandler.class
			.getName());

	private static Map<String, String> map = new HashMap<String, String>();

	private static final String key_developer_test = "key_developer_test";
	private static final String key_car_info = "key_car_info";
	private static final String key_shop_maintain = "key_shop_maintain";
	private static final String key_find_store = "key_find_store";
	private static final String key_online_service = "key_online_service";
	private static final String key_car_clear = "key_car_clear";
	private static final String key_car_facial = "key_car_facial";
	private static final String key_about_coupons = "key_about_coupons";
	private static final String key_about_review = "key_about_review";
	private static final String key_about_contact = "key_about_contact";
	private static final String key_about_us = "key_about_us";
	private static final String msg_key_developer_test = "文字链接：<a href=\"http://www.baidu.com/\">百度首页</a>\n\n 文字换行：\n 1. 洗车 \n 2. 美容 \n 输入数字选择服务\n\n";
	private static final String msg_key_car_info = "为您提供更全面的服务，对爱车进行全面监控。亲!!!记得填写哦";
	private static final String msg_key_shop_maintain = "为您提供爱车的保养记录。亲，该保养了吧！";
	private static final String msg_key_find_store = "找店导向，请就近选择您所在区域店铺!!!!";
	private static final String msg_key_online_service = "客官，有什么需要为您服务的吗?";
	private static final String msg_key_car_clear = "高大上的汽车精洗，您来了就对了。";
	private static final String msg_key_car_facial = "这里为你提供更专业的美容服务，敬请期待。经过我们专业美容后的汽车外观洁亮如新,漆面亮光长时间保持,有效延长汽车寿命。";
	private static final String msg_key_about_coupons = "亲，积分可以享受大优惠哦";
	private static final String msg_key_about_review = "亲，来看看别人眼中的大师是啥样的";
	private static final String msg_key_about_contact = "邀请朋友 独乐乐不如众乐乐，想和朋友分享来自大师修车带给您方便的服务乐趣？那就邀请他们吧！每当您邀请的朋友首次成功消费一次，我们赠送您价值100元的现金抵用券，以表达谢意。邀请越多，机会越多！";
	private static final String msg_key_about_us = "大师修车是深圳市八路通汽车科技有限公司专业服务广大车主的一款产品(神器)。";

	static {
		map.put(key_developer_test, msg_key_developer_test);
		map.put(key_car_info, msg_key_car_info);
		map.put(key_shop_maintain, msg_key_shop_maintain);
		map.put(key_find_store, msg_key_find_store);
		map.put(key_online_service, msg_key_online_service);
		map.put(key_car_clear, msg_key_car_clear);
		map.put(key_car_facial, msg_key_car_facial);
		map.put(key_about_coupons, msg_key_about_coupons);
		map.put(key_about_review, msg_key_about_review);
		map.put(key_about_contact, msg_key_about_contact);
		map.put(key_about_us, msg_key_about_us);
	}

	public static BaseMsg getResponseMsg(String eventKey) {
		BaseMsg baseMsg = null;
		String msg = map.get(eventKey);
		if (msg != null) {
			baseMsg = MessageFactory.createTextMsg(msg);
		}
		logger.debug(String.format("eventKey[%s] msg[%s]", eventKey, msg));
		return baseMsg;
	}
}
