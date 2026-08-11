---
layout: default
title: Home
permalink: /
---

<section class="hero">
  <div class="hero-media">
    {% if site.home_hero_gif and site.home_hero_gif != "" %}
      <img class="hero-gif" src="{{ site.home_hero_gif | relative_url }}" alt="APCL combustion test">
    {% elsif site.home_video_file and site.home_video_file != "" %}
      <video autoplay muted loop playsinline poster="{{ '/assets/images/hero-poster.jpg' | relative_url }}">
        <source src="{{ site.home_video_file | relative_url }}" type="video/mp4">
      </video>
    {% elsif site.home_video_youtube_id and site.home_video_youtube_id != "" %}
      <iframe src="https://www.youtube.com/embed/{{ site.home_video_youtube_id }}?autoplay=1&mute=1&loop=1&playlist={{ site.home_video_youtube_id }}&controls=0&showinfo=0&rel=0"
              title="APCL research video" frameborder="0" allow="autoplay; encrypted-media"></iframe>
    {% else %}
      <div class="hero-fallback"></div>
    {% endif %}
  </div>

  <div class="hero-content">
    <span class="hero-eyebrow">Chungbuk National Univ. · Dept. of Mechanical Engineering</span>
    <h1>{{ site.lab_name_kr }}
      <span class="en">{{ site.lab_name_en }} (APCL)</span>
    </h1>
    <div class="hero-ctas">
      <a class="btn btn-primary" href="{{ '/research/' | relative_url }}">연구 분야 보기</a>
      <a class="btn btn-ghost" href="{{ '/contact/' | relative_url }}">대학원생 모집 안내</a>
    </div>
  </div>
</section>

{% include thrust-divider.html %}

<section class="section wrap">
  <div class="section-head">
    <span class="section-eyebrow">Research Interests</span>
    <h2>핵심 연구 주제</h2>
    <p class="section-sub">
      APCL은 액체로켓 엔진과 가스터빈을 비롯한 추진장치의 분사, 연소, 열유동 현상을 실험과 해석으로 연구합니다.
    </p>
  </div>

  <div class="research-grid research-grid-home">
    <a class="research-card research-card-link" href="{{ '/research/#injector-design' | relative_url }}">
      <span class="idx">01</span>
      <h3>분사기 설계 및 제작</h3>
      <p>동축 와류형, 전단형, 핀틀형 분사기의 설계 변수와 성능 평가</p>
    </a>
    <a class="research-card research-card-link" href="{{ '/research/#spray-atomization' | relative_url }}">
      <span class="idx">02</span>
      <h3>첨단 분무 및 미립화 연구</h3>
      <p>분무각, 액적 크기, 액막 병합과 분열 메커니즘 정밀 계측</p>
    </a>
    <a class="research-card research-card-link" href="{{ '/research/#combustion-instability' | relative_url }}">
      <span class="idx">03</span>
      <h3>연소불안정 연구</h3>
      <p>압력 섭동, 음향-유동 결합, 화염 구조 변화를 분석하고 안정화 방안을 연구</p>
    </a>
    <a class="research-card research-card-link" href="{{ '/research/#methane-combustion-test' | relative_url }}">
      <span class="idx">04</span>
      <h3>메탄 연소시험</h3>
      <p>메탄 연소시험 설비를 운용하고, 설계한 분사기와 노즐의 성능을 평가</p>
    </a>
  </div>
</section>

<section class="section wrap">
  <div class="section-head">
    <span class="section-eyebrow">News &amp; Gallery</span>
    <h2>최근 소식</h2>
    <p class="section-sub">전체 소식은 News&nbsp;&amp;&nbsp;Gallery 페이지에서 확인할 수 있습니다.</p>
  </div>
  <p><a href="{{ '/news/' | relative_url }}">News & Gallery 페이지에서 최신 소식 모두 보기</a></p>
</section>
