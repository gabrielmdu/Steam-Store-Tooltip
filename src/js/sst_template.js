const sstTemplate = `<div class="steam-stt-theme">

    <div class="top">

        <div class="header-img">
            <div class="glide">
                <div class="glide__track" data-glide-el="track">
                    <ul class="glide__slides">
                        <li class="glide__slide">
                            <div class="carousel-img"></div>
                        </li>
                    </ul>
                </div>
                <div class="glide__bullets" data-glide-el="controls[nav]">
                    <button class="glide__bullet" data-glide-dir="=0"></button>
                </div>
            </div>

            <div class="user-data hidden"></div>
            <div class="metacritic hidden"><a></a></div>
        </div>

        <div class="top-right">
            <div class="name"></div>
            <div class="additional-info">
                <div class="release-date"></div>
                <div class="genres"></div>
                <div class="platforms"></div>
            </div>

            <div class="price-reviews-wrapper">
                <div class="price"></div>
                <div class="price-wrapper hidden">
                    <div class="discounted-price">
                        <div class="initial-price"></div>
                        <div class="final-price"></div>
                    </div>
                    <div class="percent"></div>
                </div>

                <div class="reviews">
                    <div class="loading no-margin"></div>
                    <img class="hidden" src="">
                    <span class="hidden"></span>
                </div>
            </div>

            <div class="categories-wrapper">
                <div class="categories"></div>
            </div>
        </div>
    </div>

    <div class="bottom">
        <div class="description"></div>
    </div>
</div>`